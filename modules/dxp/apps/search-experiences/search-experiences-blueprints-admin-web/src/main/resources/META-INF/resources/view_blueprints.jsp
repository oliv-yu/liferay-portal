<%--
/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */
--%>

<%@ include file="/init.jsp" %>

<%
ViewBlueprintsDisplayContext viewBlueprintsDisplayContext = (ViewBlueprintsDisplayContext)request.getAttribute(BlueprintsAdminWebKeys.VIEW_BLUEPRINTS_DISPLAY_CONTEXT);
%>

<portlet:actionURL name="<%= BlueprintsAdminMVCCommandNames.DELETE_BLUEPRINT %>" var="deleteBlueprintURL">
	<portlet:param name="redirect" value="<%= currentURL %>" />
</portlet:actionURL>

<clay:management-toolbar
	additionalProps='<%=
		HashMapBuilder.<String, Object>put(
			"deleteBlueprintURL", deleteBlueprintURL
		).build()
	%>'
	infoPanelId="infoPanelId"
	managementToolbarDisplayContext="<%= (ViewBlueprintsManagementToolbarDisplayContext)request.getAttribute(BlueprintsAdminWebKeys.VIEW_BLUEPRINTS_MANAGEMENT_TOOLBAR_DISPLAY_CONTEXT) %>"
	propsTransformer="js/view_blueprints/BlueprintEntriesManagementToolbarPropsTransformer"
	searchContainerId="blueprintEntries"
	supportsBulkActions="<%= true %>"
/>

<div class="closed sidenav-container sidenav-right" id="<%= liferayPortletResponse.getNamespace() + "infoPanelId" %>">
	<liferay-portlet:resourceURL copyCurrentRenderParameters="<%= false %>" id="/blueprints/info_panel" var="sidebarPanelURL" />

	<liferay-frontend:sidebar-panel
		resourceURL="<%= sidebarPanelURL %>"
		searchContainerId="blueprintsSidebar"
	>
		<clay:container-fluid
			cssClass="container-view"
		>
			<h4 class="component-title">
				<span class="text-truncate-inline">
					<liferay-ui:message key="blueprints" />
				</span>
			</h4>

			<div>
				<span class="text-secondary"><liferay-ui:message key="blueprints-help" /></span>

				<liferay-learn:message
					key="blueprints-general"
					resource="search-experiences-blueprints-admin-web"
				/>
			</div>
		</clay:container-fluid>
	</liferay-frontend:sidebar-panel>

	<div class="sidenav-content">
		<clay:container-fluid>
			<aui:form method="post" name="fm">
				<aui:input name="redirect" type="hidden" value="<%= currentURL %>" />

				<liferay-ui:search-container
					cssClass="blueprints-search-container"
					id="blueprintEntries"
					searchContainer="<%= viewBlueprintsDisplayContext.getSearchContainer() %>"
				>
					<liferay-ui:search-container-row
						className="com.liferay.search.experiences.blueprints.model.Blueprint"
						keyProperty="blueprintId"
						modelVar="entry"
					>
						<%@ include file="/blueprint_entry_search_columns.jspf" %>
					</liferay-ui:search-container-row>

					<liferay-ui:search-iterator
						displayStyle="<%= viewBlueprintsDisplayContext.getDisplayStyle() %>"
						markupView="lexicon"
					/>
				</liferay-ui:search-container>
			</aui:form>
		</clay:container-fluid>
	</div>
</div>