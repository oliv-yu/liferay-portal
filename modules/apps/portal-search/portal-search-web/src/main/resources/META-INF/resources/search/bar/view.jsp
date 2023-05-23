<%--
/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */
--%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>

<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %><%@
taglib uri="http://liferay.com/tld/clay" prefix="clay" %><%@
taglib uri="http://liferay.com/tld/ddm" prefix="liferay-ddm" %><%@
taglib uri="http://liferay.com/tld/frontend" prefix="liferay-frontend" %><%@
taglib uri="http://liferay.com/tld/theme" prefix="liferay-theme" %><%@
taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>

<%@ page import="com.liferay.portal.kernel.language.LanguageUtil" %><%@
page import="com.liferay.portal.kernel.util.HashMapBuilder" %><%@
page import="com.liferay.portal.kernel.util.ReleaseInfo" %><%@
page import="com.liferay.portal.kernel.util.Validator" %><%@
page import="com.liferay.portal.kernel.util.WebKeys" %><%@
page import="com.liferay.portal.search.web.internal.search.bar.portlet.SearchBarPortlet" %><%@
page import="com.liferay.portal.search.web.internal.search.bar.portlet.configuration.SearchBarPortletInstanceConfiguration" %><%@
page import="com.liferay.portal.search.web.internal.search.bar.portlet.display.context.SearchBarPortletDisplayContext" %>

<%@ page import="java.util.ArrayList" %>

<liferay-theme:defineObjects />

<portlet:defineObjects />

<%
SearchBarPortletDisplayContext searchBarPortletDisplayContext = (SearchBarPortletDisplayContext)java.util.Objects.requireNonNull(request.getAttribute(WebKeys.PORTLET_DISPLAY_CONTEXT));
%>

<c:choose>
	<c:when test="<%= searchBarPortletDisplayContext.isDestinationUnreachable() %>">
		<div class="alert alert-info c-mb-0 text-center">
			<liferay-ui:message key="this-search-bar-is-not-visible-to-users-yet" />

			<clay:link
				href="javascript:void(0);"
				label='<%= LanguageUtil.get(request, "set-up-its-destination-to-make-it-visible") %>'
				onClick="<%= portletDisplay.getURLConfigurationJS() %>"
			/>
		</div>
	</c:when>
	<c:otherwise>
		<aui:form action="<%= searchBarPortletDisplayContext.getSearchURL() %>" method="get" name="fm">
			<c:if test="<%= !Validator.isBlank(searchBarPortletDisplayContext.getPaginationStartParameterName()) %>">
				<input class="search-bar-reset-start-page" name="<%= searchBarPortletDisplayContext.getPaginationStartParameterName() %>" type="hidden" value="0" />
			</c:if>

			<%
			SearchBarPortletInstanceConfiguration searchBarPortletInstanceConfiguration = searchBarPortletDisplayContext.getSearchBarPortletInstanceConfiguration();
			%>

			<liferay-ddm:template-renderer
				className="<%= SearchBarPortlet.class.getName() %>"
				contextObjects='<%=
					HashMapBuilder.<String, Object>put(
						"namespace", liferayPortletResponse.getNamespace()
					).put(
						"searchBarPortletDisplayContext", searchBarPortletDisplayContext
					).build()
				%>'
				displayStyle="<%= searchBarPortletInstanceConfiguration.displayStyle() %>"
				displayStyleGroupId="<%= searchBarPortletDisplayContext.getDisplayStyleGroupId() %>"
				entries="<%= new ArrayList<>() %>"
			/>
		</aui:form>
	</c:otherwise>
</c:choose>

<c:if test="<%= searchBarPortletDisplayContext.isSuggestionsEnabled() %>">
	<liferay-frontend:component
		componentId='<%= liferayPortletResponse.getNamespace() + "suggestionsHandler" %>'
		context='<%=
			HashMapBuilder.<String, Object>put(
				"destinationFriendlyURL", searchBarPortletDisplayContext.getDestinationFriendlyURL()
			).put(
				"emptySearchEnabled", searchBarPortletDisplayContext.isEmptySearchEnabled()
			).put(
				"isDXP", ReleaseInfo.isDXP()
			).put(
				"isSearchExperiencesSupported", searchBarPortletDisplayContext.isSearchExperiencesSupported()
			).put(
				"keywords", searchBarPortletDisplayContext.getKeywords()
			).put(
				"keywordsParameterName", searchBarPortletDisplayContext.getKeywordsParameterName()
			).put(
				"letUserChooseScope", searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()
			).put(
				"namespace", liferayPortletResponse.getNamespace()
			).put(
				"paginationStartParameterName", searchBarPortletDisplayContext.getPaginationStartParameterName()
			).put(
				"scopeParameterName", searchBarPortletDisplayContext.getScopeParameterName()
			).put(
				"scopeParameterStringCurrentSite", searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString()
			).put(
				"scopeParameterStringEverything", searchBarPortletDisplayContext.getEverythingSearchScopeParameterString()
			).put(
				"searchURL", searchBarPortletDisplayContext.getSearchURL()
			).put(
				"selectedEverythingSearchScope", searchBarPortletDisplayContext.isSelectedEverythingSearchScope()
			).put(
				"suggestionsContributorConfiguration", searchBarPortletDisplayContext.getSuggestionsContributorConfiguration()
			).put(
				"suggestionsDisplayThreshold", searchBarPortletDisplayContext.getSuggestionsDisplayThreshold()
			).put(
				"suggestionsURL", searchBarPortletDisplayContext.getSuggestionsURL()
			).build()
		%>'
		module="js/utils/suggestions/index"
	/>
</c:if>