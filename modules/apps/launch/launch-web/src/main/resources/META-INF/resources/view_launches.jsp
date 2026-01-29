<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
ViewLaunchesDisplayContext viewLaunchesDisplayContext = (ViewLaunchesDisplayContext)request.getAttribute(LaunchWebKeys.VIEW_LAUNCHES_DISPLAY_CONTEXT);
%>

<div>
	<frontend-data-set:headless-display
		apiURL="<%= viewLaunchesDisplayContext.getAPIURL() %>"
		creationMenu="<%= viewLaunchesDisplayContext.getCreationMenu() %>"
		id="<%= LaunchFDSNames.LAUNCHES_ACTIVE %>"
	/>
</div>