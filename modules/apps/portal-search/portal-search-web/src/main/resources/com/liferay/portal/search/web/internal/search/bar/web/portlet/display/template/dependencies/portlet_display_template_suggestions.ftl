<#assign
	destination = searchBarPortletDisplayContext.getDestinationFriendlyURL()?has_content?then(searchBarPortletDisplayContext.getDestinationFriendlyURL(),"/search")

	staticScope = searchBarPortletDisplayContext.isSelectedEverythingSearchScope()?then(searchBarPortletDisplayContext.getEverythingSearchScopeParameterString(),searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString())
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
			<#assign data = {
				"test-id": "searchInput"
			} />

			<#if searchBarPortletDisplayContext.isSuggestionsEnabled()>
				<@liferay_aui.input
					autoFocus=true
					autocomplete="off"
					cssClass="search-bar-keywords-input"
					data=data
					id="${namespace}keywords-input"
					label=""
					name=htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())
					onkeydown="${namespace}handleInputKeydown(this)"
					placeholder=searchBarPortletDisplayContext.getInputPlaceholder()
					title=languageUtil.get(locale, "search")
					type="text"
					useNamespace=false
					value=htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())
					wrapperCssClass="input-group-item input-group-prepend search-bar-keywords-input-wrapper"
				/>
			<#else>
				<@liferay_aui.input
					autoFocus=true
					autocomplete="off"
					cssClass="search-bar-keywords-input"
					data=data
					label=""
					name=htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())
					placeholder=searchBarPortletDisplayContext.getInputPlaceholder()
					title=languageUtil.get(locale, "search")
					type="text"
					useNamespace=false
					value=htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())
					wrapperCssClass="input-group-item input-group-prepend search-bar-keywords-input-wrapper"
				/>
			</#if>

			<@liferay_aui.select
				cssClass="search-bar-scope-select"
				id="${namespace}scope-select"
				label=""
				name=htmlUtil.escape(searchBarPortletDisplayContext.getScopeParameterName())
				title="scope"
				useNamespace=false
				wrapperCssClass="input-group-item input-group-append input-group-item-shrink search-bar-search-select-wrapper"
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
				<@clay["button"]
					aria\-label="${languageUtil.get(locale, 'search')}"
					displayType="secondary"
					icon="search"
					type="submit"
				/>
			</div>
		<#else>
			<div class="input-group-item search-bar-keywords-input-wrapper">
				<#if searchBarPortletDisplayContext.isSuggestionsEnabled()>
					<input
						autocomplete="off"
						class="form-control input-group-inset input-group-inset-after search-bar-keywords-input"
						data-qa-id="searchInput"
						id="${namespace}keywords-input"
						onkeydown="${namespace}handleInputKeydown(this)"
						name="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywordsParameterName())}"
						placeholder="${searchBarPortletDisplayContext.getInputPlaceholder()}"
						title="${languageUtil.get(locale, 'search')}"
						type="text"
						value="${htmlUtil.escape(searchBarPortletDisplayContext.getKeywords())}"
					/>
				<#else>
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
				</#if>

				<div class="input-group-inset-item input-group-inset-item-after">
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
					value='${staticScope}'
				/>
			</div>
		</#if>

		<ul class="autocomplete-dropdown-menu dropdown-menu search-bar-suggestions-dropdown-menu searchbar-dropdown-menu" id="${namespace}suggestions"></ul>
	</div>
</@>

<script type="text/javascript">
	function ${namespace}handleInputKeydown(target) {
		const inputValue = target.value;
		const suggestionsElement = document.getElementById('${namespace}suggestions');

		${namespace}fetchSuggestions(inputValue)
			.then((data) => {
				if (data.items && data.items.length) {
					suggestionsElement.classList.add('show');

					const searchURL =
						'${searchBarPortletDisplayContext.getSearchURL()}' +
						${namespace}updateQueryString(
							document.location.search,
							inputValue
						);

					suggestionsElement.innerHTML = ${namespace}renderSuggestionGroups(data.items) + ${namespace}renderSeeMoreLink(searchURL);
			} else {
				suggestionsElement.classList.remove('show');
			}
		});
	}

	function ${namespace}handleClickOutside(event) {
		const suggestionsElement = document.getElementById('${namespace}suggestions');
		const inputElement = document.getElementById('${namespace}keywords-input');

		if (suggestionsElement?.classList?.contains('show')
			&& !inputElement.contains(event.target) && !suggestionsElement.contains(event.target)) {

			suggestionsElement.classList.remove('show');
		}
	}

	function ${namespace}updateQueryString(queryString, inputValue) {
		const searchParams = new URLSearchParams(queryString);

		const paginationStartParameterName = '${searchBarPortletDisplayContext.getPaginationStartParameterName()}';

		if (${searchBarPortletDisplayContext.isEmptySearchEnabled()?c} || inputValue) {
			searchParams.set(
				'${searchBarPortletDisplayContext.getKeywordsParameterName()}',
				inputValue.replace(/^\s+|\s+$/, '')
			);
		}

		if (paginationStartParameterName) {
			searchParams.delete(paginationStartParameterName);
		}

		if (${searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()?c}) {
			searchParams.set(
				'${searchBarPortletDisplayContext.getScopeParameterName()}',
				${namespace}getScope()
			);
		}

		searchParams.delete('p_p_id');
		searchParams.delete('p_p_state');
		searchParams.delete('start');

		return '?' + searchParams.toString();
	}

	function ${namespace}fetchSuggestions(keyword) {
		const suggestionsURL = new URL(
			Liferay.ThemeDisplay.getPathContext() + '/o/portal-search-rest/v1.0/suggestions',
			Liferay.ThemeDisplay.getPortalURL()
		);

		return Liferay.Util.fetch(
			Liferay.Util.addParams(
				{
					currentURL: window.location.href,
					destinationFriendlyURL: '${destination}',
					groupId: Liferay.ThemeDisplay.getScopeGroupId(),
					keywordsParameterName: '${searchBarPortletDisplayContext.getKeywordsParameterName()}',
					plid: Liferay.ThemeDisplay.getPlid(),
					scope: ${namespace}getScope(),
					search: keyword,
				},
				suggestionsURL.href
			),
			{
				body: JSON.stringify(${searchBarPortletDisplayContext.getSuggestionsContributorConfiguration()}),
				headers: new Headers({
					'Accept': 'application/json',
					'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
					'Content-Type': 'application/json',
				}),
				method: 'POST',
			}
		).then(
			(response) => response.json()
		);
	}

	function ${namespace}getScope() {
		if (${searchBarPortletDisplayContext.isLetTheUserChooseTheSearchScope()?c}) {
			const scopeSelectElement = document.getElementById('${namespace}scope-select');

			return scopeSelectElement ? scopeSelectElement.value : '${searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString()}';
		}

		return '${staticScope}';
	}

	function ${namespace}renderSeeMoreLink(searchURL) {
		return '<ul class="list-unstyled">' +
			'<li><a class="dropdown-item search-bar-suggestions-show-more" href="' +
			searchURL +
			'"><@liferay_ui["message"] key="see-more"/></a></li>' +
			'</ul>';
	}

	function ${namespace}renderSuggestionGroups(suggestionGroups,searchURL) {
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
		}).join('');
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

	function ${namespace}main() {
		if (${searchBarPortletDisplayContext.isSuggestionsEnabled()?c}) {
			const removeClickListener = () => {
				document.body.removeEventListener('click', ${namespace}handleClickOutside);
			}

			document.body.addEventListener('click', ${namespace}handleClickOutside);
		}
	}

	${namespace}main();
</script>