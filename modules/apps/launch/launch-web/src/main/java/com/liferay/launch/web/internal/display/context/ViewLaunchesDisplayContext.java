/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.web.internal.display.context;

import com.liferay.frontend.taglib.clay.servlet.taglib.util.CreationMenu;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.CreationMenuBuilder;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.kernel.workflow.WorkflowConstants;

import jakarta.servlet.http.HttpServletRequest;

/**
 * @author Olivia Yu
 */
public class ViewLaunchesDisplayContext {

	public ViewLaunchesDisplayContext(
		HttpServletRequest httpServletRequest,
		LayoutLocalService layoutLocalService, Language language,
		Portal portal) {

		_httpServletRequest = httpServletRequest;
		_layoutLocalService = layoutLocalService;
		_language = language;
		_portal = portal;

		_themeDisplay = (ThemeDisplay)httpServletRequest.getAttribute(
			WebKeys.THEME_DISPLAY);
	}

	public String getAPIURL() {
		return StringBundler.concat(
			"/o/change-tracking-rest/v1.0/ct-collections?status=",
			WorkflowConstants.STATUS_DRAFT, "&status=",
			WorkflowConstants.STATUS_EXPIRED, "&status=",
			WorkflowConstants.STATUS_INCOMPLETE);
	}

	public CreationMenu getCreationMenu() {
		return CreationMenuBuilder.addPrimaryDropdownItem(
			dropdownItem -> {
				dropdownItem.setHref('/');
				dropdownItem.setLabel(
					_language.get(_httpServletRequest, "create-new-launch"));
			}
		).build();
	}

	private final HttpServletRequest _httpServletRequest;
	private final Language _language;
	private final LayoutLocalService _layoutLocalService;
	private final Portal _portal;
	private final ThemeDisplay _themeDisplay;

}