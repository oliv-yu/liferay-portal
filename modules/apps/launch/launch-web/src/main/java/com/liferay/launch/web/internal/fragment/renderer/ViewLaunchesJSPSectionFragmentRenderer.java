/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.web.internal.fragment.renderer;

import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.launch.web.internal.display.context.ViewLaunchesDisplayContext;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.util.Portal;

import jakarta.servlet.http.HttpServletRequest;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Olivia Yu
 */
@Component(service = FragmentRenderer.class)
public class ViewLaunchesJSPSectionFragmentRenderer
	extends BaseJSPSectionFragmentRenderer<ViewLaunchesDisplayContext> {

	@Override
	public String getLabelKey() {
		return "view-launches";
	}

	@Override
	protected ViewLaunchesDisplayContext getDisplayContext(
		HttpServletRequest httpServletRequest) {

		return new ViewLaunchesDisplayContext(
			httpServletRequest, _layoutLocalService, language, _portal);
	}

	@Override
	protected String getJSPPath() {
		return "/view_launches.jsp";
	}

	@Reference
	private LayoutLocalService _layoutLocalService;

	@Reference
	private Portal _portal;

}