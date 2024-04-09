<#assign
	searchInputId = namespace + stringUtil.randomId()
/>

<@liferay_aui.fieldset cssClass="search-bar">
	<@liferay_aui.input
		cssClass="search-bar-empty-search-input"
		name="emptySearchEnabled"
		type="hidden"
		value=searchBarPortletDisplayContext.isEmptySearchEnabled()
	/>

	<div class="input-group ${searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()?then("search-bar-scope","search-bar-simple")}">
		<#if searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()>
			<div class="input-group-item input-group-item-shrink input-group-prepend">
				<@clay["button"]
					aria\-label="${languageUtil.get(locale, 'search')}"
					displayType="secondary"
					icon="search"
					type="submit"
				/>
			</div>

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

			<#assign data = {
				"test-id": "searchInput"
			} />

			<@liferay_aui.input
				autoFocus=true
				autocomplete="off"
				cssClass="search-bar-keywords-input"
				data=data
				id="${searchInputId}"
				label=""
				name=htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())
				placeholder=searchBarPortletDisplayContext.getInputPlaceholder()
				title=languageUtil.get(locale, "search")
				type="text"
				useNamespace=false
				value=htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())
				wrapperCssClass="input-group-item input-group-append search-bar-keywords-input-wrapper"
			/>
		<#else>
			<div class="input-group-item search-bar-keywords-input-wrapper">
				<input
					autocomplete="off"
					class="form-control input-group-inset input-group-inset-before search-bar-keywords-input"
					data-qa-id="searchInput"
					id="${searchInputId}"
					name="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())}"
					placeholder="${searchBarPortletDisplayContext.getInputPlaceholder()}"
					title="${languageUtil.get(locale, "search")}"
					type="text"
					value="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())}"
				/>

				<div class="input-group-inset-item input-group-inset-item-before">
					<@clay["button"]
						aria\-label="${languageUtil.get(locale, 'search')}"
						displayType="unstyled"
						icon="search"
						type="submit"
					/>
				</div>

				<@liferay_aui.input
					name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
					type="hidden"
					value=searchBarPortletDisplayContext.getScopeParameterValue()
				/>
			</div>
		</#if>
	</div>
</@>

<#if searchBarPortletDisplayContext.isSuggestionsEnabled()>
	<script>
		Liferay.on('liferaySearchAutocompleteReady', () => {
			Liferay.Search.Autocomplete('${searchInputId}', {
				containerClass: 'search-bar-autocomplete',
				destinationFriendlyURL:
					'${searchBarPortletDisplayContext.getDestinationFriendlyURL()}',
				isSelectedEverythingSearchScope:
					'${searchBarPortletDisplayContext.isSelectedEverythingSearchScope()?c}',
				scopeParameterStringCurrentSite:
					'${searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString()}',
				scopeParameterStringEverything:
					'${searchBarPortletDisplayContext.getEverythingSearchScopeParameterString()}',
				showEmptyResultsMenu: true,
				suggestionsContributorConfiguration:
					'${searchBarPortletDisplayContext.getSuggestionsContributorConfiguration()}',
				suggestionsURL:
					'${searchBarPortletDisplayContext.getSuggestionsURL()}',
				templates: {
					renderEmptyResultsMenu: () => {
						return (
							`<li class="dropdown-subheader text-1">${languageUtil.get(
								locale,
								'no-results-found'
							)}<li>`
					);
					},
					renderHeader: (group) => {
						return (
							`<li class="dropdown-subheader text-1">` +
							group.displayGroupName +
							`</li>`
						);
					},
					renderItem: (hit) => {
						return (
							`<a class="dropdown-item" href="` +
							hit.attributes.assetURL +
							`">
								<div class="list-group-text text-dark text-1">` +
							hit.text +
							`</div>
								<div class="list-group-text text-truncate text-1">` +
							hit.attributes.assetSearchSummary +
							`</div>
							</a>`
						);
					},
					renderMenu: (resource, {onShowMore, renderHeader, renderItem, renderShowMore}) => {
						return (
							resource.items
								?.map((group) => {
									return (
										renderHeader(group) +
										group.suggestions
											?.map((hit) => renderItem(hit))
											.join('')
									);
								})
								.join('') + renderShowMore(onShowMore)
						);
					},
					renderShowMore: (onShowMore) => {
						return (
							`<button class="dropdown-item search-bar-suggestions-show-more text-1" onClick="` +
							onShowMore +
							`">${languageUtil.get(locale, 'show-more')}</button>`
						);
					},
				},
			});
		});
	</script>
</#if>