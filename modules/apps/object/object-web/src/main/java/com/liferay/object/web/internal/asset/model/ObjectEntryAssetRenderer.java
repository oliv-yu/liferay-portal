/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.asset.model;

import com.liferay.asset.display.page.portlet.AssetDisplayPageFriendlyURLProvider;
import com.liferay.asset.kernel.model.BaseJSPAssetRenderer;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalService;
import com.liferay.document.library.configuration.DLConfiguration;
import com.liferay.document.library.kernel.model.DLFileEntry;
import com.liferay.document.library.kernel.service.DLAppLocalService;
import com.liferay.document.library.kernel.service.DLFileEntryLocalServiceUtil;
import com.liferay.document.library.util.DLURLHelper;
import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.InfoItemReference;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectWebKeys;
import com.liferay.object.display.context.ObjectEntryDisplayContextFactory;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectEntryService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.portlet.LiferayPortletRequest;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.service.GroupLocalServiceUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.trash.TrashRenderer;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.util.WebKeys;

import jakarta.portlet.PortletRequest;
import jakarta.portlet.PortletResponse;
import jakarta.portlet.PortletURL;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.Serializable;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * @author Feliphe Marinho
 */
public class ObjectEntryAssetRenderer
	extends BaseJSPAssetRenderer<ObjectEntry> implements TrashRenderer {

	public ObjectEntryAssetRenderer(
			AssetDisplayPageFriendlyURLProvider
				assetDisplayPageFriendlyURLProvider,
			DepotEntryLocalService depotEntryLocalService,
			DLAppLocalService dlAppLocalService, DLURLHelper dlURLHelper,
			ObjectDefinition objectDefinition, ObjectEntry objectEntry,
			ObjectEntryDisplayContextFactory objectEntryDisplayContextFactory,
			ObjectEntryService objectEntryService,
			ObjectFieldLocalService objectFieldLocalService)
		throws PortalException {

		_assetDisplayPageFriendlyURLProvider =
			assetDisplayPageFriendlyURLProvider;
		_depotEntryLocalService = depotEntryLocalService;
		_dlAppLocalService = dlAppLocalService;
		_dlURLHelper = dlURLHelper;
		_objectDefinition = objectDefinition;
		_objectEntry = objectEntry;
		_objectEntryDisplayContextFactory = objectEntryDisplayContextFactory;
		_objectEntryService = objectEntryService;
		_objectFieldLocalService = objectFieldLocalService;
	}

	@Override
	public ObjectEntry getAssetObject() {
		return _objectEntry;
	}

	@Override
	public String getClassName() {
		return _objectEntry.getModelClassName();
	}

	@Override
	public long getClassPK() {
		return _objectEntry.getObjectEntryId();
	}

	@Override
	public long getGroupId() {
		return _objectEntry.getGroupId();
	}

	@Override
	public String getIconCssClass() {
		if (_objectDefinition.isCMS()) {
			String externalReferenceCode =
				_objectDefinition.getExternalReferenceCode();

			if (Objects.equals(externalReferenceCode, "L_CMS_BASIC_DOCUMENT")) {
				return _getFileMimeType();
			}
			else if (Objects.equals(
						externalReferenceCode, "L_CMS_BASIC_WEB_CONTENT")) {

				return "forms";
			}
			else if (Objects.equals(externalReferenceCode, "L_CMS_BLOG")) {
				return "blogs";
			}
			else if (Objects.equals(
						externalReferenceCode, "L_CMS_EXTERNAL_VIDEO")) {

				return "document-multimedia";
			}

			return "web-content";
		}

		return StringPool.BLANK;
	}

	@Override
	public String getJspPath(
		HttpServletRequest httpServletRequest, String template) {

		if (template.equals(TEMPLATE_ABSTRACT) ||
			template.equals(TEMPLATE_FULL_CONTENT)) {

			return "/object_entries/edit_object_entry.jsp";
		}

		return null;
	}

	@Override
	public String getPortletId() {
		return _objectDefinition.getPortletId();
	}

	@Override
	public String getSummary(
		PortletRequest portletRequest, PortletResponse portletResponse) {

		return StringPool.BLANK;
	}

	@Override
	public String getTitle(Locale locale) {
		try {
			return _objectEntry.getTitleValue(
				LocaleUtil.toLanguageId(locale), true);
		}
		catch (PortalException portalException) {
			if (_log.isWarnEnabled()) {
				_log.warn(portalException);
			}
		}

		return StringPool.BLANK;
	}

	@Override
	public String getType() {
		return _objectDefinition.getName();
	}

	@Override
	public String getURLDownload(ThemeDisplay themeDisplay) {
		if (_objectDefinition.isCMS()) {
			List<ObjectField> objectFields =
				_objectFieldLocalService.getObjectFields(
					_objectDefinition.getObjectDefinitionId());

			for (ObjectField objectField : objectFields) {
				if (Objects.equals(
						objectField.getBusinessType(),
						ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

					try {
						FileEntry fileEntry = _dlAppLocalService.getFileEntry(
							GetterUtil.getLong(
								_objectEntry.getValues(
								).get(
									objectField.getName()
								)));

						return _dlURLHelper.getDownloadURL(
							fileEntry, fileEntry.getFileVersion(), themeDisplay,
							StringPool.BLANK);
					}
					catch (PortalException portalException) {
						if (_log.isDebugEnabled()) {
							_log.debug(portalException);
						}
					}
				}
			}
		}

		return null;
	}

	@Override
	public PortletURL getURLEdit(HttpServletRequest httpServletRequest)
		throws Exception {

		Group group = GroupLocalServiceUtil.fetchGroup(
			_objectEntry.getGroupId());

		if ((group != null) && group.isCompany()) {
			ThemeDisplay themeDisplay =
				(ThemeDisplay)httpServletRequest.getAttribute(
					WebKeys.THEME_DISPLAY);

			group = themeDisplay.getScopeGroup();
		}

		return PortletURLBuilder.create(
			PortalUtil.getControlPanelPortletURL(
				httpServletRequest, group, _objectDefinition.getPortletId(), 0,
				0, PortletRequest.RENDER_PHASE)
		).setMVCRenderCommandName(
			"/object_entries/edit_object_entry"
		).setParameter(
			"externalReferenceCode", _objectEntry.getExternalReferenceCode()
		).setParameter(
			"groupId", _objectEntry.getGroupId()
		).buildPortletURL();
	}

	@Override
	public PortletURL getURLEdit(
			LiferayPortletRequest liferayPortletRequest,
			LiferayPortletResponse liferayPortletResponse)
		throws Exception {

		return getURLEdit(
			PortalUtil.getHttpServletRequest(liferayPortletRequest));
	}

	@Override
	public String getURLSharingNotification(ThemeDisplay themeDisplay)
		throws Exception {

		if (themeDisplay == null) {
			return null;
		}

		DepotEntry depotEntry = _depotEntryLocalService.fetchGroupDepotEntry(
			_objectEntry.getGroupId());

		if ((depotEntry == null) ||
			(depotEntry.getType() != DepotConstants.TYPE_SPACE)) {

			return getURLViewInContext(themeDisplay, StringPool.BLANK);
		}

		return StringBundler.concat(
			themeDisplay.getPortalURL(), themeDisplay.getPathMain(),
			GroupConstants.CMS_FRIENDLY_URL,
			"/edit_content_item?objectEntryId=",
			_objectEntry.getObjectEntryId(), "&p_l_mode=read&redirect=",
			HtmlUtil.escapeURL(themeDisplay.getURLCurrent()));
	}

	@Override
	public String getURLViewInContext(
			LiferayPortletRequest liferayPortletRequest,
			LiferayPortletResponse liferayPortletResponse,
			String noSuchEntryRedirect)
		throws Exception {

		ThemeDisplay themeDisplay =
			(ThemeDisplay)liferayPortletRequest.getAttribute(
				WebKeys.THEME_DISPLAY);

		if (themeDisplay == null) {
			return null;
		}

		return getURLViewInContext(themeDisplay, noSuchEntryRedirect);
	}

	@Override
	public String getURLViewInContext(
			ThemeDisplay themeDisplay, String noSuchEntryRedirect)
		throws Exception {

		if (themeDisplay == null) {
			return null;
		}

		return _assetDisplayPageFriendlyURLProvider.getFriendlyURL(
			new InfoItemReference(
				getClassName(), new ClassPKInfoItemIdentifier(getClassPK())),
			themeDisplay);
	}

	@Override
	public long getUserId() {
		return _objectEntry.getUserId();
	}

	@Override
	public String getUserName() {
		return _objectEntry.getUserName();
	}

	@Override
	public String getUuid() {
		return _objectEntry.getUuid();
	}

	@Override
	public boolean hasEditPermission(PermissionChecker permissionChecker)
		throws PortalException {

		try {
			return _objectEntryService.hasModelResourcePermission(
				_objectEntry, ActionKeys.UPDATE);
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(portalException);
			}

			return false;
		}
	}

	@Override
	public boolean hasViewPermission(PermissionChecker permissionChecker)
		throws PortalException {

		try {
			return _objectEntryService.hasModelResourcePermission(
				_objectEntry, ActionKeys.VIEW);
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(portalException);
			}

			return false;
		}
	}

	@Override
	public boolean include(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse, String template)
		throws Exception {

		httpServletRequest.setAttribute(
			ObjectWebKeys.OBJECT_DEFINITION, _objectDefinition);
		httpServletRequest.setAttribute(
			ObjectWebKeys.OBJECT_ENTRY_EXTERNAL_REFERENCE_CODE,
			_objectEntry.getExternalReferenceCode());
		httpServletRequest.setAttribute(
			ObjectWebKeys.OBJECT_ENTRY_GROUP_ID, _objectEntry.getGroupId());
		httpServletRequest.setAttribute(
			ObjectWebKeys.OBJECT_ENTRY_READ_ONLY, Boolean.TRUE);
		httpServletRequest.setAttribute(WebKeys.TEMPLATE, template);

		httpServletRequest.setAttribute(
			WebKeys.PORTLET_DISPLAY_CONTEXT,
			_objectEntryDisplayContextFactory.create(httpServletRequest));

		return super.include(httpServletRequest, httpServletResponse, template);
	}

	@Override
	public boolean isCommentable() {
		return _objectDefinition.isEnableComments();
	}

	private boolean _containsMimeType(String[] mimeTypes, String mimeType) {
		for (String curMimeType : mimeTypes) {
			int pos = curMimeType.indexOf("/");

			if (pos != -1) {
				if (mimeType.equals(curMimeType)) {
					return true;
				}
			}
			else {
				if (mimeType.startsWith(curMimeType)) {
					return true;
				}
			}
		}

		return false;
	}

	private String _getFileMimeType() {
		List<ObjectField> objectFields =
			_objectFieldLocalService.getObjectFields(
				_objectDefinition.getObjectDefinitionId());

		if (objectFields == null) {
			return null;
		}

		for (ObjectField objectField : objectFields) {
			if (Objects.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

				try {
					Map<String, Serializable> values = _objectEntry.getValues();

					Serializable fileEntryIdSerializable = values.get(
						objectField.getName());

					if (fileEntryIdSerializable == null) {
						continue;
					}

					long fileEntryId = GetterUtil.getLong(
						fileEntryIdSerializable);

					if (fileEntryId <= 0) {
						continue;
					}

					DLFileEntry dlFileEntry =
						DLFileEntryLocalServiceUtil.getDLFileEntry(fileEntryId);

					return dlFileEntry.getMimeType();
				}
				catch (PortalException portalException) {
					if (_log.isWarnEnabled()) {
						_log.warn(
							"Error getting MIME type for attachment field " +
								objectField.getName(),
							portalException);
					}
				}
			}
		}

		return null;
	}

//	private String _getIconFileMimeType(String mimeType) {
//		if (_containsMimeType(_dlConfiguration.codeFileMimeTypes(), mimeType)) {
//			return "document-code";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.compressedFileMimeTypes(), mimeType)) {
//
//			return "document-compressed";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.multimediaFileMimeTypes(), mimeType)) {
//
//			if (mimeType.startsWith("image")) {
//				return "document-image";
//			}
//
//			return "document-multimedia";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.presentationFileMimeTypes(), mimeType)) {
//
//			return "document-presentation";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.spreadSheetFileMimeTypes(), mimeType)) {
//
//			return "document-table";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.textFileMimeTypes(), mimeType)) {
//
//			return "document-text";
//		}
//		else if (_containsMimeType(
//					_dlConfiguration.vectorialFileMimeTypes(), mimeType)) {
//
//			return "document-vector";
//		}
//
//		return "document-default";
//	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectEntryAssetRenderer.class);

	private final AssetDisplayPageFriendlyURLProvider
		_assetDisplayPageFriendlyURLProvider;
	private final DepotEntryLocalService _depotEntryLocalService;
	private final DLAppLocalService _dlAppLocalService;
	private final DLURLHelper _dlURLHelper;
	private final ObjectDefinition _objectDefinition;
	private final ObjectEntry _objectEntry;
	private final ObjectEntryDisplayContextFactory
		_objectEntryDisplayContextFactory;
	private final ObjectEntryService _objectEntryService;
	private final ObjectFieldLocalService _objectFieldLocalService;

}