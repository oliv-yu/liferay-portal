/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.search.experiences.web.internal.display.context;

import com.liferay.asset.kernel.AssetRendererFactoryRegistryUtil;
import com.liferay.asset.kernel.model.AssetRendererFactory;
import com.liferay.asset.kernel.model.ClassType;
import com.liferay.asset.kernel.model.ClassTypeReader;
import com.liferay.asset.list.util.comparator.ClassNameModelResourceComparator;
import com.liferay.asset.util.AssetRendererFactoryClassProvider;
import com.liferay.asset.util.comparator.AssetRendererFactoryTypeNameComparator;
import com.liferay.document.library.kernel.model.DLFileEntry;
import com.liferay.document.library.kernel.model.DLFileEntryMetadata;
import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.service.DDMStructureLocalService;
import com.liferay.item.selector.ItemSelector;
import com.liferay.item.selector.ItemSelectorCriterion;
import com.liferay.item.selector.criteria.GroupItemSelectorReturnType;
import com.liferay.journal.model.JournalArticle;
import com.liferay.learn.LearnMessageUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.portlet.RequestBackedPortletURLFactoryUtil;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;
import com.liferay.portal.kernel.portlet.url.builder.ResourceURLBuilder;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.search.experiences.service.SXPBlueprintLocalService;
import com.liferay.site.item.selector.SiteItemSelectorCriterion;=

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;

import static com.liferay.portal.kernel.service.GroupLocalServiceUtil.getActiveGroups;

/**
 * @author Eudaldo Alonso
 */
public class EditSXPBlueprintDisplayContext {

	public EditSXPBlueprintDisplayContext(
		AssetRendererFactoryClassProvider assetRendererFactoryClassProvider,
		DDMStructureLocalService ddmStructureLocalService,
		GroupLocalService groupLocalService, ItemSelector itemSelector,
		Portal portal, RenderRequest renderRequest,
		RenderResponse renderResponse,
		SXPBlueprintLocalService sxpBlueprintLocalService) {

		_assetRendererFactoryClassProvider = assetRendererFactoryClassProvider;
		_ddmStructureLocalService = ddmStructureLocalService;
		_groupLocalService = groupLocalService;
		_itemSelector = itemSelector;
		_portal = portal;
		_renderRequest = renderRequest;
		_renderResponse = renderResponse;
		_sxpBlueprintLocalService = sxpBlueprintLocalService;

		_themeDisplay = (ThemeDisplay)renderRequest.getAttribute(
			WebKeys.THEME_DISPLAY);
	}

	public List<Long> getAvailableClassNameIds() {
		if (_availableClassNameIds != null) {
			return _availableClassNameIds;
		}

		List<Long> availableClassNameIds = ListUtil.fromArray(
			AssetRendererFactoryRegistryUtil.getIndexableClassNameIds(
				_themeDisplay.getCompanyId(), true));

		availableClassNameIds = ListUtil.sort(
			availableClassNameIds,
			new ClassNameModelResourceComparator(
				true, _themeDisplay.getLocale()));

		_availableClassNameIds = availableClassNameIds;

		return _availableClassNameIds;
	}

	public String getClassName(AssetRendererFactory<?> assetRendererFactory) {
		Class<? extends AssetRendererFactory<?>> clazz =
			_assetRendererFactoryClassProvider.getClass(assetRendererFactory);

		String className = clazz.getName();

		return className.substring(
			className.lastIndexOf(StringPool.PERIOD) + 1);
	}

	public long[] getClassNameIds(
		UnicodeProperties unicodeProperties, long[] availableClassNameIds) {

		boolean anyAssetType = GetterUtil.getBoolean(
			unicodeProperties.getProperty(
				"anyAssetType", Boolean.TRUE.toString()));
		String selectionStyle = unicodeProperties.getProperty(
			"selectionStyle", "dynamic");

		if (anyAssetType || selectionStyle.equals("manual")) {
			return availableClassNameIds;
		}

		long defaultClassNameId = GetterUtil.getLong(
			unicodeProperties.getProperty("anyAssetType", null));

		if (defaultClassNameId > 0) {
			if (ArrayUtil.contains(availableClassNameIds, defaultClassNameId)) {
				return new long[] {defaultClassNameId};
			}

			return new long[0];
		}

		long[] classNameIds = GetterUtil.getLongValues(
			StringUtil.split(
				unicodeProperties.getProperty(
					"classNameIds", StringPool.BLANK)));

		if (ArrayUtil.isNotEmpty(classNameIds)) {
			return classNameIds;
		}

		return availableClassNameIds;
	}

	public Long[] getClassTypeIds(
		List<ClassType> availableClassTypes) {

		Long[] availableClassTypeIds = new Long[availableClassTypes.size()];

		for (int i = 0; i < availableClassTypeIds.length; i++) {
			ClassType classType = availableClassTypes.get(i);

			availableClassTypeIds[i] = classType.getClassTypeId();
		}

		return availableClassTypeIds;
	}

	public Map<String, Object> getProps() {
		return HashMapBuilder.<String, Object>put(
			"defaultLocale", LocaleUtil.toLanguageId(LocaleUtil.getDefault())
		).put(
			"fetchSitesURL",
			ResourceURLBuilder.createResourceURL(
				_renderResponse
			).setCMD(
				"getSitesJSONObject"
			).setResourceID(
				"/sxp_blueprint_admin/get_sites"
			).buildString()
		).put(
			"isCompanyAdmin",
			() -> {
				PermissionChecker permissionChecker =
					_themeDisplay.getPermissionChecker();

				return permissionChecker.isCompanyAdmin();
			}
		).put(
			"learnMessages",
			LearnMessageUtil.getJSONObject("search-experiences-web")
		).put(
			"locale", _themeDisplay.getLanguageId()
		).put(
			"namespace", _renderResponse.getNamespace()
		).put(
			"redirectURL", getRedirect()
		).put(
			"selectSitesURL",
			() -> {
				ItemSelectorCriterion itemSelectorCriterion =
					new SiteItemSelectorCriterion();

				itemSelectorCriterion.setDesiredItemSelectorReturnTypes(
					new GroupItemSelectorReturnType());

				return PortletURLBuilder.create(
					_itemSelector.getItemSelectorURL(
						RequestBackedPortletURLFactoryUtil.create(
							_renderRequest),
						_renderResponse.getNamespace() + "selectSite",
						itemSelectorCriterion)
				).buildString();
			}
		).put(
			"subtypes",
			_getSubtypes()
		).put(
			"sxpBlueprintId",
			ParamUtil.getLong(_renderRequest, "sxpBlueprintId")
		).build();
	}

	public String getRedirect() {
		if (Validator.isNotNull(_redirect)) {
			return _redirect;
		}

		String redirect = ParamUtil.getString(_renderRequest, "redirect");

		if (Validator.isNull(redirect)) {
			redirect = PortletURLBuilder.createRenderURL(
				_renderResponse
			).setMVCRenderCommandName(
				"/sxp_blueprint_admin/view_sxp_blueprints"
			).buildString();
		}

		_redirect = redirect;

		return _redirect;
	}

	private long[] _getGroupIds() {
		List<Group> groups = _groupLocalService.getActiveGroups(
			_themeDisplay.getCompanyId(), true);

		long[] groupIds = new long[groups.size()];

		for (int i = 0; i < groups.size(); i++) {
			groupIds[i] = groups.get(i).getGroupId();
		}

		return groupIds;
	}

	private GroupLocalService _groupLocalService;

	private List<Map<String, String>> _getSubtypes2() {
		List<Map<String, String>> subtypeList = new LinkedList<>();

		List<DDMStructure> structures =
			_ddmStructureLocalService.getStructures();

		for (DDMStructure ddmStructure : structures) {

			if (ddmStructure.getCompanyId() != _themeDisplay.getCompanyId()) {
				continue;
			}

			long classNameId = ddmStructure.getClassNameId();






			for (DDMStructure ddmStructure : structures) {
				try {
					Group group = _groupLocalService.getGroup(
						ddmStructure.getGroupId());

					subtypeList.add(HashMapBuilder.put(
						"classSubtypeExternalReferenceCode",
						ddmStructure.getExternalReferenceCode()
					).put(
						"groupExternalReferenceCode",
						group.getExternalReferenceCode()
					).put(
						"groupLocalizedName",
						group.getName(_themeDisplay.getLocale())
					).put(
						"classSubtypeLocalizedName",
						ddmStructure.getName(_themeDisplay.getLocale())
					).put(
						"classType", clazz.getName()
					).put(
						"classLocalizedName",
						clazz.getName()
					).build());
				}
				catch (Exception exception) {

				}
			}
		}

		return subtypeList;
	}

	private List<Map<String, String>> _getSubtypes() {

		Class[] classes = new Class[] {JournalArticle.class, DLFileEntryMetadata.class};

		List<Map<String, String>> subtypeList = new LinkedList<>();

		for (Class clazz : classes) {

			List<DDMStructure> classStructures =
				_ddmStructureLocalService.getClassStructures(
					_themeDisplay.getCompanyId(),
					_portal.getClassNameId(clazz)
				);

			for (DDMStructure ddmStructure : classStructures) {
				try {
					Group group = _groupLocalService.getGroup(
						ddmStructure.getGroupId());

					subtypeList.add(HashMapBuilder.put(
						"classSubtypeExternalReferenceCode",
						ddmStructure.getExternalReferenceCode()
					).put(
						"groupExternalReferenceCode",
						group.getExternalReferenceCode()
					).put(
						"groupLocalizedName",
						group.getName(_themeDisplay.getLocale())
					).put(
						"classSubtypeLocalizedName",
						ddmStructure.getName(_themeDisplay.getLocale())
					).put(
						"classType", clazz.getName()
					).put(
						"classLocalizedName",
						clazz.getName()
					).build());
				}
				catch (Exception exception) {

				}
			}
		}

		return subtypeList;
	}

	private void _getTypes() {
		List<AssetRendererFactory<?>> assetRendererFactories = ListUtil.sort(
			AssetRendererFactoryRegistryUtil.getAssetRendererFactories(
				_themeDisplay.getCompanyId()),
			new AssetRendererFactoryTypeNameComparator(
				_themeDisplay.getLocale()));

		List<AssetRendererFactory<?>> classTypesAssetRendererFactories =
			new ArrayList<>();

		HashMap<String, List<HashMap>> classesHashMap =
			new HashMap<>();

		for (AssetRendererFactory<?> assetRendererFactory :
				assetRendererFactories) {

			ClassTypeReader classTypeReader =
				assetRendererFactory.getClassTypeReader();

			for (long groupId : _getGroupIds()) {

				List<ClassType> classTypes =
					classTypeReader.getAvailableClassTypes(
						new long[] {groupId}, _themeDisplay.getLocale());

				if (classTypes.isEmpty()) {
					continue;
				}



//				classTypes.sort(
//					new ClassTypeNameComparator(_themeDisplay.getLocale()));
//				classTypesAssetRendererFactories.add(assetRendererFactory);
//				String className = getClassName(assetRendererFactory);
//
				Long[] assetSelectedClassTypeIds = getClassTypeIds(
					classTypes);
//
//				// Left list
//
//				List<KeyValuePair> subtypesLeftList = new ArrayList<>();

				for (long subtypeId : assetSelectedClassTypeIds) {
					try {
						ClassType classType = classTypeReader.getClassType(
							subtypeId, _themeDisplay.getLocale());
//I think we just make special logic for JournalArticle and DLFiles to get their ERCs
						HashMapBuilder.put(
							"classType", assetRendererFactory.getClassName()
						).put(
							"Localized Type",
							assetRendererFactory.getClassName()
						).put(
							"classSubtype", classType.getName()
						).build();
//
//						subtypesLeftList.add(
//							new KeyValuePair(
//								String.valueOf(subtypeId),
//								HtmlUtil.escape(classType.getName())));
					}
					catch (Exception exception) {
					}
				}

				for (ClassType classType : classTypes) {
					HashMapBuilder.put(
						"classType", assetRendererFactory.getClassName()
					).put(
						"Localized Type",
						assetRendererFactory.getClassName()
					).put(
						"classSubtype", classType.getName()
					).build();
				}
//
//				Arrays.sort(assetSelectedClassTypeIds);
			}

			// Right list

//			List<KeyValuePair> subtypesRightList = new ArrayList<>();
//
//			boolean noAssetSubtypeSelected = false;
//
//			if (Validator.isNull(
//					_unicodeProperties.getProperty(
//						"anyClassType" + className))) {
//
//				noAssetSubtypeSelected = true;
//			}
//
//			boolean anyAssetSubtype = GetterUtil.getBoolean(
//				_unicodeProperties.getProperty(
//					"anyClassType" + className, Boolean.TRUE.toString()));
//
//			if (noAssetSubtypeSelected) {
//				anyAssetSubtype = false;
//			}
		}
	}

	private final AssetRendererFactoryClassProvider
		_assetRendererFactoryClassProvider;
	private List<Long> _availableClassNameIds;
	private long[] _classNameIds;
	private long[] _classTypeIds;
	private final ItemSelector _itemSelector;
	private String _redirect;
	private final Portal _portal;
	private final RenderRequest _renderRequest;
	private final RenderResponse _renderResponse;
	private final DDMStructureLocalService _ddmStructureLocalService;
	private final SXPBlueprintLocalService _sxpBlueprintLocalService;
	private final ThemeDisplay _themeDisplay;

}