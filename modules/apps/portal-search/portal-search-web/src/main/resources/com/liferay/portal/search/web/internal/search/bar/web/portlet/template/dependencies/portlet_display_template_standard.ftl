<@liferay_aui.form
	action=searchBarPortletDisplayContext.getSearchURL()
	method="get"
	name="fm"
>
	<#if searchBarPortletDisplayContext.getPaginationStartParameterName()??>
		<input class="search-bar-reset-start-page" name="${searchBarPortletDisplayContext.getPaginationStartParameterName()}" type="hidden" value="0" />
	</#if>

<@liferay_aui.fieldset cssClass="search-bar">
		<@liferay_aui.input
			cssClass="search-bar-empty-search-input"
			name="emptySearchEnabled"
			type="hidden"
			value="${searchBarPortletDisplayContext.isEmptySearchEnabled()?c}"
		/>

		<div class="input-group ${searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()?then("search-bar-scope","search-bar-simple")}">
			<#assign data = {
				"test-id": "searchInput"
			} />

			<#if searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()>
				<@liferay_aui.input
					autoFocus=true
					cssClass="search-bar-keywords-input"
					data=data
					label=""
					name=htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())
					placeholder=searchBarPortletDisplayContext.getInputPlaceholder()
					title="search"
					type="text"
					useNamespace=false
					value=searchBarPortletDisplayContext.getKeywords()
					wrapperCssClass="input-group-item input-group-prepend search-bar-keywords-input-wrapper"
				/>

				<@liferay_aui.select
					cssClass="search-bar-scope-select"
					label=""
					name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
					title="scope"
					useNamespace=false
					wrapperCssClass="input-group-item input-group-item-shrink input-group-prepend search-bar-search-select-wrapper"
				>
					<@liferay_aui.option
						label="this-site"
						selected=searchBarPortletDisplayContext.isSelectedCurrentSiteSearchScope()
						value=searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString()
					/>

					<#if searchBarPortletDisplayContext.isAvailableEverythingSearchScope()>
						<@liferay_aui.option
							label="everything"
							selected=searchBarPortletDisplayContext.isSelectedEverythingSearchScope()
							value=searchBarPortletDisplayContext.getEverythingSearchScopeParameterString()
						/>
					</#if>
				</@>

				<div class="input-group-append input-group-item input-group-item-shrink">
					<@clay.button
						ariaLabel=languageUtil.get(locale, "submit")
						icon="search"
						style="secondary"
						type="submit"
					/>
				</div>
			<#else>
				<div class="input-group-item search-bar-keywords-input-wrapper">
					<input
						class="form-control input-group-inset input-group-inset-after search-bar-keywords-input" data-qa-id="searchInput"
					id="${namespace + stringUtil.randomId()}" name="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())}" placeholder="${searchBarPortletDisplayContext.getInputPlaceholder()}" title="${languageUtil.get(locale, 'search')}" type="text" value="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())}" />

					<@liferay_aui.input
						name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
						type="hidden"
						value=searchBarPortletDisplayContext.getScopeParameterValue()
					/>

					<div class="input-group-inset-item input-group-inset-item-after">
						<@clay.button
							ariaLabel=languageUtil.get(locale, "submit")
							icon="search"
							style="unstyled"
							type="submit"
						/>
					</div>
				</div>
			</#if>
		</div>
	</@>
</@>

<@liferay_aui.script use="liferay-search-bar">
	new Liferay.Search.SearchBar(A.one('#${namespace}fm'));
</@>