<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ taglib uri="jakarta.tags.core" prefix="c" %>

<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %><%@
taglib uri="http://liferay.com/tld/learn" prefix="liferay-learn" %><%@
taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>

<%@ page import="com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil" %><%@
page import="com.liferay.portal.kernel.language.LanguageUtil" %><%@
page import="com.liferay.portal.search.web.internal.search.results.configuration.SearchResultsPortletInstanceConfiguration" %>

<%
SearchResultsPortletInstanceConfiguration searchResultsPortletInstanceConfiguration = (SearchResultsPortletInstanceConfiguration)request.getAttribute(SearchResultsPortletInstanceConfiguration.class.getName());
%>

<aui:input name="displayStyle" type="textarea" value="<%= searchResultsPortletInstanceConfiguration.displayStyle() %>" />

<aui:input name="displayStyleGroupExternalReferenceCode" type="textarea" value="<%= searchResultsPortletInstanceConfiguration.displayStyleGroupExternalReferenceCode() %>" />

<aui:input name="displayStyleGroupId" value="<%= searchResultsPortletInstanceConfiguration.displayStyleGroupId() %>" wrapperCssClass="mb-0" />

<div class="form-feedback-group mb-4">
	<span class="form-help-text">
		<liferay-ui:message key="display-style-group-id-description" />
	</span>
</div>

<aui:input disabled='<%= !FeatureFlagManagerUtil.isEnabled("LPD-98858") %>' label="limit-result-count-accuracy" name="limitResultCountAccuracy" type="checkbox" value="<%= searchResultsPortletInstanceConfiguration.limitResultCountAccuracy() %>" wrapperCssClass="mb-0" />

<div class="form-feedback-group mb-4">
	<span class="form-help-text">
		<liferay-ui:message key="limit-result-count-accuracy-help" />

		<liferay-learn:message
			key="configuring-the-search-results-widget"
			resource="portal-search-web"
		/>

		<c:if test='<%= !FeatureFlagManagerUtil.isEnabled("LPD-98858") %>'>
			<liferay-ui:message arguments='<%= LanguageUtil.get(request, "feature.flag.LPD-98858.title") %>' key="limit-result-count-accuracy-feature-flag-help" translateArguments="<%= false %>" />
		</c:if>
	</span>
</div>