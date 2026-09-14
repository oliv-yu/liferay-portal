<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
String className = ParamUtil.getString(request, "className");
long classTypeId = ParamUtil.getLong(request, "classTypeId");
String ddmStructureDisplayFieldValue = ParamUtil.getString(request, "ddmStructureDisplayFieldValue");
String ddmStructureFieldName = ParamUtil.getString(request, "ddmStructureFieldName");
Serializable ddmStructureFieldValue = ParamUtil.getString(request, "ddmStructureFieldValue");
String name = ParamUtil.getString(request, "name");

AssetRendererFactory<?> assetRendererFactory = AssetRendererFactoryRegistryUtil.getAssetRendererFactoryByClassName(className);

ClassTypeReader classTypeReader = assetRendererFactory.getClassTypeReader();

ClassType classType = classTypeReader.getClassType(classTypeId, locale);

ClassTypeField classTypeField = classType.getClassTypeField(name);

com.liferay.dynamic.data.mapping.storage.Field ddmField = new com.liferay.dynamic.data.mapping.storage.Field();

ddmField.setDefaultLocale(themeDisplay.getLocale());
ddmField.setDDMStructureId(classTypeField.getClassTypeId());
ddmField.setName(name);

if (name.equals(ddmStructureFieldName)) {
	ddmField.setValue(themeDisplay.getLocale(), ddmStructureFieldValue);
}

// A date is stored in the DDM format, but the form field parses what the user
// would type, so seed the client with the value already formatted for the
// locale. Every other field type stores what the client expects.

String ddmFormFieldValue = String.valueOf(ddmStructureFieldValue);

if (Validator.isNotNull(ddmStructureDisplayFieldValue) && ArrayUtil.contains(new String[] {"date", "date_time", "ddm-date"}, classTypeField.getType())) {
	ddmFormFieldValue = ddmStructureDisplayFieldValue;
}
%>

<liferay-ddm:html-field
	classNameId="<%= PortalUtil.getClassNameId(DDMStructure.class) %>"
	classPK="<%= classTypeField.getClassTypeId() %>"
	field="<%= ddmField %>"
/>

<aui:script>
	Liferay.componentReady('<portlet:namespace />ddmForm').then(() => {
		const initialDDMForm = Liferay.component('<portlet:namespace />ddmForm');

		initialDDMForm.get('fields').forEach((field) => {
			if (
				field.get('name') ===
				'<%= HtmlUtil.escape((String)ddmStructureFieldName) %>'
			) {
				field.setValue('<%= HtmlUtil.escapeJS(ddmFormFieldValue) %>');
			}
		});
	});
</aui:script>