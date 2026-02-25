/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.asset.model;

import com.liferay.asset.display.page.portlet.AssetDisplayPageFriendlyURLProvider;
import com.liferay.asset.kernel.model.BaseJSPAssetRenderer;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalService;
import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.InfoItemReference;
import com.liferay.object.constants.ObjectPortletKeys;
import com.liferay.object.model.ObjectEntryFolder;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.portlet.LiferayPortletRequest;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.service.GroupLocalServiceUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.WebKeys;

import jakarta.portlet.PortletRequest;
import jakarta.portlet.PortletResponse;
import jakarta.portlet.PortletURL;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Locale;

/**
 * @author Mikel Lorza
 */
public class ObjectEntryFolderAssetRenderer
	extends BaseJSPAssetRenderer<ObjectEntryFolder> {

	public ObjectEntryFolderAssetRenderer(
		AssetDisplayPageFriendlyURLProvider assetDisplayPageFriendlyURLProvider,
		DepotEntryLocalService depotEntryLocalService,
		ObjectEntryFolder objectEntryFolder,
		ObjectEntryFolderAssetRendererFactory
			objectEntryFolderAssetRendererFactory,
		Portal portal) {

		_assetDisplayPageFriendlyURLProvider =
			assetDisplayPageFriendlyURLProvider;
		_depotEntryLocalService = depotEntryLocalService;
		_objectEntryFolder = objectEntryFolder;
		_objectEntryFolderAssetRendererFactory =
			objectEntryFolderAssetRendererFactory;
		_portal = portal;
	}

	@Override
	public ObjectEntryFolder getAssetObject() {
		return _objectEntryFolder;
	}

	@Override
	public String getClassName() {
		return ObjectEntryFolder.class.getName();
	}

	@Override
	public long getClassPK() {
		return _objectEntryFolder.getObjectEntryFolderId();
	}

	@Override
	public long getGroupId() {
		return _objectEntryFolder.getGroupId();
	}

	@Override
	public String getJspPath(
		HttpServletRequest httpServletRequest, String template) {

		if (template.equals(TEMPLATE_ABSTRACT) ||
			template.equals(TEMPLATE_FULL_CONTENT)) {

			return "/object_folders/edit_object_folder.jsp";
		}

		return null;
	}

	@Override
	public String getSummary(
		PortletRequest portletRequest, PortletResponse portletResponse) {

		return StringPool.BLANK;
	}

	@Override
	public String getTitle(Locale locale) {
		return _objectEntryFolder.getLabel(locale);
	}

	@Override
	public PortletURL getURLEdit(
			LiferayPortletRequest liferayPortletRequest,
			LiferayPortletResponse liferayPortletResponse)
		throws Exception {

		HttpServletRequest httpServletRequest = _portal.getHttpServletRequest(
			liferayPortletRequest);

		Group group = GroupLocalServiceUtil.fetchGroup(
			_objectEntryFolder.getGroupId());

		if ((group != null) && group.isCompany()) {
			ThemeDisplay themeDisplay =
				(ThemeDisplay)httpServletRequest.getAttribute(
					WebKeys.THEME_DISPLAY);

			group = themeDisplay.getScopeGroup();
		}

		return PortletURLBuilder.create(
			_portal.getControlPanelPortletURL(
				httpServletRequest, group, ObjectPortletKeys.OBJECT_ENTRY_FOLDER, 0,
				0, PortletRequest.RENDER_PHASE)
		).setMVCRenderCommandName(
			"/object_folders/edit_object_folder"
		).setParameter(
			"objectEntryFolderId", _objectEntryFolder.getObjectEntryFolderId()
		).buildPortletURL();
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
				getClassName(),
				new ClassPKInfoItemIdentifier(getClassPK())),
			themeDisplay);
	}

	@Override
	public long getUserId() {
		return _objectEntryFolder.getUserId();
	}

	@Override
	public String getUserName() {
		return _objectEntryFolder.getUserName();
	}

	@Override
	public String getUuid() {
		return _objectEntryFolder.getUuid();
	}

	@Override
	public boolean hasEditPermission(PermissionChecker permissionChecker)
		throws PortalException {

		return _hasPermission(permissionChecker, ActionKeys.UPDATE);
	}

	@Override
	public boolean hasViewPermission(PermissionChecker permissionChecker)
		throws PortalException {

		return _hasPermission(permissionChecker, ActionKeys.VIEW);
	}

	@Override
	public boolean include(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse, String template)
		throws Exception {

		httpServletRequest.setAttribute(
			"objectEntryFolderId", _objectEntryFolder.getObjectEntryFolderId());

		return super.include(httpServletRequest, httpServletResponse, template);
	}

	@Override
	public boolean isDisplayable() {
		return true;
	}

	private boolean _hasPermission(
			PermissionChecker permissionChecker, String actionId)
		throws PortalException {

		try {
			return _objectEntryFolderAssetRendererFactory.hasPermission(
				permissionChecker, _objectEntryFolder.getObjectEntryFolderId(),
				actionId);
		}
		catch (PortalException | RuntimeException exception) {
			throw exception;
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}
	}

	private final AssetDisplayPageFriendlyURLProvider
		_assetDisplayPageFriendlyURLProvider;
	private final DepotEntryLocalService _depotEntryLocalService;
	private final ObjectEntryFolder _objectEntryFolder;
	private final ObjectEntryFolderAssetRendererFactory
		_objectEntryFolderAssetRendererFactory;
	private final Portal _portal;

}