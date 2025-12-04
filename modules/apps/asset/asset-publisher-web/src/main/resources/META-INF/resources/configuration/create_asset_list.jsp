<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
String portletResource = ParamUtil.getString(request, "portletResource");

long[] classNameIds = AssetRendererFactoryRegistryUtil.getIndexableClassNameIds(themeDisplay.getCompanyId(), true);
%>

<div class="mb-2">
	<liferay-portlet:actionURL name="/asset_publisher/add_asset_list" portletName="<%= portletResource %>" var="addAssetListURL">
		<portlet:param name="portletResource" value="<%= portletResource %>" />
		<portlet:param name="redirect" value="<%= currentURL %>" />
		<portlet:param name="typeSettingsProperties--anyAssetType--" value="true" />
		<portlet:param name="typeSettingsProperties--classNameIds--" value="<%= StringUtil.merge(classNameIds) %>" />

		<%
		for (long classNameId : classNameIds) {
			if (classNameId <= 0) {
				continue;
			}

			AssetRendererFactory<?> assetRendererFactory = AssetRendererFactoryRegistryUtil.getAssetRendererFactoryByClassNameId(classNameId);

			if (assetRendererFactory == null) {
				continue;
			}
		%>

			<c:if test="<%= assetRendererFactory.isSupportsClassTypes() %>">

				<%
				ClassTypeReader classTypeReader = assetRendererFactory.getClassTypeReader();

				List<ClassType> availableClassTypes = classTypeReader.getAvailableClassTypes(PortalUtil.getCurrentAndAncestorSiteGroupIds(themeDisplay.getScopeGroupId()), themeDisplay.getLocale());
				%>

				<c:if test="<%= !availableClassTypes.isEmpty() %>">

					<%
					long[] classTypeIds = ListUtil.toLongArray(availableClassTypes, ClassType::getClassTypeId);

					Class<?> factoryClass = assetRendererFactory.getClass();

					if (assetRendererFactory instanceof AssetRendererFactoryWrapper) {
						factoryClass = ((AssetRendererFactoryWrapper<?>)assetRendererFactory).getWrappedClass();
					}
					%>

					<portlet:param name='<%= "typeSettingsProperties--classTypeIds" + factoryClass.getSimpleName() + "--" %>' value="<%= StringUtil.merge(classTypeIds) %>" />
				</c:if>
			</c:if>

		<%
		}
		%>

	</liferay-portlet:actionURL>

	<clay:button
		additionalProps='<%=
			HashMapBuilder.<String, Object>put(
				"portletNamespace", PortalUtil.getPortletNamespace(HtmlUtil.escape(portletResource))
			).put(
				"url", addAssetListURL
			).put(
				"redirect", currentURL
			).build()
		%>'
		cssClass="c-pl-0 create-collection-link"
		displayType="link"
		id='<%= liferayPortletResponse.getNamespace() + "collectionButton" %>'
		label="create-a-collection-from-this-configuration"
		propsTransformer="{CreateAssetListActionButtonPropsTransformer} from asset-publisher-web"
	/>
</div>