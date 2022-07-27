<@liferay_ui["panel-container"]
	extended=true
	id="${namespace + 'facetAssetCategoriesPanelContainer'}"
	markupView="lexicon"
	persistState=true
>
	<@liferay_ui.panel
		collapsible=true
		cssClass="search-facet"
		id="${namespace + 'facetAssetCategoriesPanel'}"
		markupView="lexicon"
		persistState=true
		title="category"
	>
		<#list assetCategoriesSearchFacetDisplayContext.getVocabularyNames() as vocabularyName>
			<b>${vocabularyName}</b>

			<ul class="list-unstyled">
				<#if entries?has_content>
					<#list entries as entry>
						<#if entry.getVocabularyName() == vocabularyName>
							<li class="facet-value">
								<button
									class="btn btn-link btn-unstyled facet-term ${(entry.isSelected())?then('facet-term-selected', 'facet-term-unselected')} term-name"
									data-term-id="${entry.getAssetCategoryId()}"
									disabled
									onClick="Liferay.Search.FacetUtil.changeSelection(event);"
								>
								${htmlUtil.escape(entry.getDisplayName())}
								<#if entry.isFrequencyVisible()>
									<small class="term-count">
										(${entry.getFrequency()})
									</small>
								</#if>
								</button>
							</li>
						</#if>
					</#list>
				</#if>
			</ul>
		</#list>

		<#if !assetCategoriesSearchFacetDisplayContext.isNothingSelected()>
			<@liferay_aui.button
				cssClass="btn-link btn-unstyled facet-clear-btn"
				onClick="Liferay.Search.FacetUtil.clearSelections(event);"
				value="clear"
			/>
		</#if>
	</@>
</@>