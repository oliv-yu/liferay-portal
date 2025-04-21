<div class="form-group-autofit">
	<div class="form-group-item form-group-item-label form-group-item-shrink">
		<label for="${namespace + 'sortSelectionDropdown'}">
			<span class="text-truncate-inline">
				<span class="text-truncate">
					${languageUtil.get(locale, "sort-by")}
				</span>
			</span>
		</label>
	</div>

	<#if sortDisplayContext.getSelectedSortTerm()??>
		<#assign sortTerm = sortDisplayContext.getSelectedSortTerm().getLabel() />
	<#else>
		<#assign sortTerm = "relevance" />
	</#if>

	<div class="form-group-item">
		<@clay["dropdown-menu"]
			cssClass="form-control form-control-select"
			displayType="secondary"
			dropdownItems=sortDisplayContext.getActionDropdownItems()
			id="${namespace + 'sortSelectionDropdown'}"
			label=sortTerm
		/>
	</div>
</div>