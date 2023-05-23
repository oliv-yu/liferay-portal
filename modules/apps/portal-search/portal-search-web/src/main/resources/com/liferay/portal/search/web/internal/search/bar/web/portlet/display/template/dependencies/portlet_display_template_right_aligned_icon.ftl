<@liferay_aui.fieldset cssClass="search-bar">
	<@liferay_aui.input
		cssClass="search-bar-empty-search-input"
		name="emptySearchEnabled"
		type="hidden"
		value=searchBarPortletDisplayContext.isEmptySearchEnabled()
	/>

	<div class="input-group ${searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()?then("search-bar-scope","search-bar-simple")}">
		<#if searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()>
			<#assign data = {
				"test-id": "searchInput"
			} />

			<@liferay_aui.input
				autoFocus=true
				autocomplete="off"
				cssClass="search-bar-keywords-input"
				data=data
				id="${namespace}keywords-input"
				label=""
				name=htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())
				placeholder=searchBarPortletDisplayContext.getInputPlaceholder()
				title=languageUtil.get(locale, "search")
				type="text"
				useNamespace=false
				value=htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())
				wrapperCssClass="input-group-item input-group-prepend search-bar-keywords-input-wrapper"
			/>

			<@liferay_aui.select
				cssClass="search-bar-scope-select"
				id="${namespace}scope-select"
				label=""
				name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
				title="scope"
				useNamespace=false
				wrapperCssClass="input-group-item input-group-prepend input-group-item-shrink search-bar-search-select-wrapper"
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
				<span class="hide inline-item input-group-text" id="${namespace}loading">
					<span
						class="loading-animation loading-animation-secondary loading-animation-sm"
					/>
				</span>
			</div>

			<div class="input-group-append input-group-item input-group-item-shrink">
				<@clay["button"]
					aria\-label="${languageUtil.get(locale, 'search')}"
					displayType="secondary"
					icon="search"
					id="${namespace}submit"
					type="submit"
				/>
			</div>
		<#else>
			<div class="input-group-item search-bar-keywords-input-wrapper">
				<input
					autocomplete="off"
					class="form-control input-group-inset input-group-inset-after search-bar-keywords-input"
					data-qa-id="searchInput"
				 	id="${namespace}keywords-input"
					name="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())}"
					placeholder="${searchBarPortletDisplayContext.getInputPlaceholder()}"
					title="${languageUtil.get(locale, 'search')}"
					type="text"
					value="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())}"
				/>

				<div class="input-group-inset-item input-group-inset-item-after">
					<span class="inline-item">
						<span
							id="${namespace}loading"
							class="hide loading-animation loading-animation-secondary loading-animation-sm"
						/>
					</span>

					<@clay["button"]
						aria\-label="${languageUtil.get(locale, 'search')}"
						displayType="unstyled"
						icon="search"
						id="${namespace}submit"
						type="submit"
					/>
				</div>

				<@liferay_aui.input
					name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
					type="hidden"
					value="${searchBarPortletDisplayContext.isSelectedEverythingSearchScope()?then(searchBarPortletDisplayContext.getEverythingSearchScopeParameterString(),searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString())}"
				/>
			</div>
		</#if>

		<ul class="autocomplete-dropdown-menu dropdown-menu search-bar-suggestions-dropdown-menu searchbar-dropdown-menu" id="${namespace}suggestions"></ul>
	</div>
</@>

<@liferay_aui.script>
	function ${namespace}renderSuggestions(suggestionGroups, searchURL) {
		return suggestionGroups
			.map(function (suggestionGroup) {
			return (
				'<li class="dropdown-subheader">' +
				Liferay.Util.escapeHTML(suggestionGroup.displayGroupName) +
				'</li>' +
				'<ul class="list-unstyled search-bar-suggestions-results-list">' +
				${namespace}renderSuggestionGroupItems(
					suggestionGroup.suggestions
				) +
				'</ul>'
			);
		}).join('') +
		'<ul class="list-unstyled">' +
		'<li><a class="dropdown-item search-bar-suggestions-show-more" href="' +
		searchURL +
		'"><@liferay_ui["message"] key="see-more"/></a></li>' +
		'</ul>';
	}

	function ${namespace}renderSuggestionGroupItems(suggestionGroupItems) {
		return suggestionGroupItems
			.map(function (suggestion) {
				return (
					'<li>' +
					'<a class="dropdown-item" href="' +
					suggestion.attributes.assetURL +
					'">' +
					'<div class="suggestion-item-title">' +
					Liferay.Util.escapeHTML(suggestion.text) +
					'</div>' +
					(suggestion.attributes.assetSearchSummary
						? '<div class="suggestion-item-description">' +
							'<div class="text-truncate-inline">' +
							'<div class="text-truncate">' +
							Liferay.Util.escapeHTML(
								suggestion.attributes.assetSearchSummary
							) +
							'</div>' +
							'</div>' +
							'</div>'
						: '') +
					'</a>' +
					'</li>'
				);
			})
			.join('');
	}

	function ${namespace}handleLoadingStart() {
		const loadingElement = document.getElementById(
			'${namespace}loading'
		);
		const submitElement = document.getElementById(
			'${namespace}submit'
		);

		if (loadingElement && submitElement) {
			loadingElement.classList.remove('hide');
			submitElement.classList.add('hide');
		}
	}

	function ${namespace}handleLoadingEnd() {
		const loadingElement = document.getElementById(
			'${namespace}loading'
		);
		const submitElement = document.getElementById(
			'${namespace}submit'
		);

		if (loadingElement && submitElement) {
			loadingElement.classList.add('hide');
			submitElement.classList.remove('hide');
		}
	}

	if (${searchBarPortletDisplayContext.isSuggestionsEnabled()?c}) {
		setTimeout(function () {
			if (Liferay.Search.Suggestions['${namespace}']) {
				Liferay.Search.Suggestions['${namespace}'].initialize({
					onLoadingEnd: ${namespace}handleLoadingEnd,
					onLoadingStart: ${namespace}handleLoadingStart,
					renderSuggestions: ${namespace}renderSuggestions,
				});
			}
		}, 2000);
	}
</@liferay_aui.script>