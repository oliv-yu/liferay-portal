<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<liferay-portlet:renderURL var="backURL" />

<clay:container-fluid
	cssClass="container-form-lg"
	fullWidth="<%= true %>"
>
	<div>
		<b>Hello</b> from the Launches portlet!
	</div>
</clay:container-fluid>