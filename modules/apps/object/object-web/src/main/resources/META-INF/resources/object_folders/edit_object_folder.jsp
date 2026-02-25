<%--
/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
String redirect = ParamUtil.getString(request, "redirect");
long objectEntryFolderId = ParamUtil.getLong(request, "objectEntryFolderId");

ObjectEntryFolder objectEntryFolder = ObjectEntryFolderLocalServiceUtil.fetchObjectEntryFolder(objectEntryFolderId);
%>

<div class="container-fluid-max-xl">
	<portlet:actionURL name="/object_folders/edit_object_folder" var="editObjectFolderURL" />

	<aui:form action="<%= editObjectFolderURL %>" method="post" name="fm">
		<aui:input name="objectEntryFolderId" type="hidden" value="<%= objectEntryFolderId %>" />

		<liferay-frontend:fieldset>
			<aui:input label="name" name="name" value="<%= (objectEntryFolder != null) ? objectEntryFolder.getName() : StringPool.BLANK %>">
				<aui:validator name="required" />
			</aui:input>

			<aui:input label="description" name="description" type="textarea" value="<%= (objectEntryFolder != null) ? objectEntryFolder.getDescription() : StringPool.BLANK %>" />
		</liferay-frontend:fieldset>

		<aui:button-row>
			<aui:button type="submit" />

			<aui:button href="<%= redirect %>" type="cancel" />
		</aui:button-row>
	</aui:form>
</div>