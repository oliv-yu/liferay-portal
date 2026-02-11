/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.asset.taglib.internal.display.context;

import com.liferay.asset.kernel.model.AssetCategory;
import com.liferay.asset.kernel.model.AssetEntry;
import com.liferay.asset.kernel.model.AssetVocabulary;
import com.liferay.asset.kernel.service.AssetCategoryServiceUtil;
import com.liferay.asset.kernel.service.AssetEntryLocalServiceUtil;
import com.liferay.asset.kernel.service.AssetVocabularyServiceUtil;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalServiceUtil;
import com.liferay.depot.util.SiteConnectedGroupGroupProviderUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.service.GroupLocalServiceUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.ListUtil;

import jakarta.portlet.PortletURL;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author Jürgen Kappler
 */
public class AssetCategoriesSummaryDisplayContext {

	public AssetCategoriesSummaryDisplayContext(
		HttpServletRequest httpServletRequest) {

		_httpServletRequest = httpServletRequest;
	}

	public String buildCategoryPath(
			AssetCategory category, ThemeDisplay themeDisplay)
		throws PortalException {

		List<AssetCategory> ancestorCategories = category.getAncestors();

		if (ancestorCategories.isEmpty()) {
			return HtmlUtil.escape(category.getTitle(themeDisplay.getLocale()));
		}

		Collections.reverse(ancestorCategories);

		StringBundler sb = new StringBundler(
			(ancestorCategories.size() * 2) + 1);

		for (AssetCategory ancestorCategory : ancestorCategories) {
			sb.append(
				HtmlUtil.escape(
					ancestorCategory.getTitle(themeDisplay.getLocale())));
			sb.append(" &raquo; ");
		}

		sb.append(HtmlUtil.escape(category.getTitle(themeDisplay.getLocale())));

		return sb.toString();
	}

	public List<AssetCategory> filterCategories(
		List<AssetCategory> categories, AssetVocabulary vocabulary) {

		List<AssetCategory> filteredCategories = new ArrayList<>();

		int[] visibleTypes = (int[])_httpServletRequest.getAttribute(
			"liferay-asset:asset-categories-summary:visibleTypes");

		for (AssetCategory category : categories) {
			if ((category.getVocabularyId() == vocabulary.getVocabularyId()) &&
				ArrayUtil.contains(
					visibleTypes, vocabulary.getVisibilityType())) {

				filteredCategories.add(category);
			}
		}

		return filteredCategories;
	}

	public List<AssetCategory> getCategories() throws PortalException {
		List<AssetCategory> categories =
			(List<AssetCategory>)_httpServletRequest.getAttribute(
				"liferay-asset:asset-categories-summary:assetCategories");

		if (ListUtil.isEmpty(categories)) {
			categories = AssetCategoryServiceUtil.getCategories(
				getClassName(), getClassPK());
		}

		return categories;
	}

	public String getClassName() {
		if (_className != null) {
			return _className;
		}

		_className = (String)_httpServletRequest.getAttribute(
			"liferay-asset:asset-categories-summary:className");

		return _className;
	}

	public Long getClassPK() {
		if (_classPK != null) {
			return _classPK;
		}

		_classPK = GetterUtil.getLong(
			(String)_httpServletRequest.getAttribute(
				"liferay-asset:asset-categories-summary:classPK"));

		return _classPK;
	}

	public String getDisplayStyle() {
		if (_displayStyle != null) {
			return _displayStyle;
		}

		_displayStyle = GetterUtil.getString(
			(String)_httpServletRequest.getAttribute(
				"liferay-asset:asset-categories-summary:displayStyle"),
			"default");

		return _displayStyle;
	}

	public String getParamName() {
		if (_paramName != null) {
			return _paramName;
		}

		_paramName = GetterUtil.getString(
			(String)_httpServletRequest.getAttribute(
				"liferay-asset:asset-categories-summary:paramName"),
			"categoryId");

		return _paramName;
	}

	public PortletURL getPortletURL() {
		if (_portletURL != null) {
			return _portletURL;
		}

		_portletURL = (PortletURL)_httpServletRequest.getAttribute(
			"liferay-asset:asset-categories-summary:portletURL");

		return _portletURL;
	}

	public List<AssetVocabulary> getVocabularies(long scopeGroupId)
		throws PortalException {

		long groupId = scopeGroupId;

		AssetEntry assetEntry = AssetEntryLocalServiceUtil.fetchEntry(
			getClassName(), getClassPK());

		if (assetEntry != null) {
			groupId = assetEntry.getGroupId();
		}

		return AssetVocabularyServiceUtil.getGroupVocabularies(
			_getCurrentAndAncestorSiteAndDepotGroupIds(groupId));
	}

	private long[] _getCurrentAndAncestorSiteAndDepotGroupIds(long groupId)
		throws PortalException {

		long[] currentAndAncestorSiteAndDepotGroupIds =
			SiteConnectedGroupGroupProviderUtil.
				getCurrentAndAncestorSiteAndDepotGroupIds(groupId);

		DepotEntry depotEntry = DepotEntryLocalServiceUtil.fetchGroupDepotEntry(
			groupId);

		if ((depotEntry == null) ||
			(depotEntry.getType() != DepotConstants.TYPE_SPACE)) {

			return currentAndAncestorSiteAndDepotGroupIds;
		}

		Group cmsGroup = GroupLocalServiceUtil.fetchGroup(
			depotEntry.getCompanyId(), GroupConstants.CMS);

		if (cmsGroup == null) {
			return currentAndAncestorSiteAndDepotGroupIds;
		}

		return ArrayUtil.append(
			currentAndAncestorSiteAndDepotGroupIds, cmsGroup.getGroupId());
	}

	private String _className;
	private Long _classPK;
	private String _displayStyle;
	private final HttpServletRequest _httpServletRequest;
	private String _paramName;
	private PortletURL _portletURL;

}