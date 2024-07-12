<@liferay_ui["panel-container"]
	extended=true
	id="${namespace + 'facetDatePanelContainer'}"
	markupView="lexicon"
	persistState=true
>
	<@liferay_ui.panel
		collapsible=true
		cssClass="search-facet"
		id="${namespace + 'facetDatePanel'}"
		markupView="lexicon"
		persistState=true
		title="date"
	>
		<#if !dateFacetDisplayContext.isNothingSelected()>
			<@clay.button
				cssClass="btn-unstyled c-mb-4 facet-clear-btn"
				displayType="link"
				id="${namespace + 'facetDateClear'}"
				onClick="Liferay.Search.FacetUtil.clearSelections(event);"
			>
				<strong>${languageUtil.get(locale, "clear")}</strong>
			</@clay.button>
		</#if>

		<ul class="date list-unstyled">
			<#if entries?has_content>
				<#list entries as entry>
					<li class="facet-value">
						<div class="custom-checkbox custom-control">
							<label class="facet-checkbox-label" for="${namespace}${entry.getBucketText()}">
								<input
									${(entry.isSelected())?then("checked", "")}
									class="custom-control-input facet-term"
									data-term-id="${htmlUtil.escape(entry.getBucketText())}"
									disabled
									id="${namespace}${entry.getBucketText()}"
									name="${namespace}${entry.getBucketText()}"
									onChange='Liferay.Search.FacetUtil.changeSelection(event);'
									type="checkbox"
								/>

								<span class="custom-control-label term-name ${(entry.isSelected())?then('facet-term-selected', 'facet-term-unselected')}">
									<span class="custom-control-label-text">
										<#if entry.isSelected()>
											<strong><@liferay_ui["message"] key="${htmlUtil.escape(entry.getBucketText())}" /></strong>
										<#else>
											<@liferay_ui["message"] key="${htmlUtil.escape(entry.getBucketText())}" />
										</#if>
									</span>
								</span>

								<#if entry.isFrequencyVisible()>
									<small class="term-count">
										(${entry.getFrequency()})
									</small>
								</#if>
							</label>
						</div>
					</li>
				</#list>
			</#if>

			<li class="facet-value">
				<div class="custom-checkbox custom-control">
					<label class="facet-checkbox-label" for="${namespace}${customRangeBucketDisplayContext.getBucketText()}">
						<input
							${(customRangeBucketDisplayContext.isSelected())?then("checked", "")}
							class="custom-control-input facet-term"
							data-term-id="${htmlUtil.escape(customRangeBucketDisplayContext.getBucketText())}"
							disabled
							id="${namespace}${customRangeBucketDisplayContext.getBucketText()}"
							name="${namespace}${customRangeBucketDisplayContext.getBucketText()}"
							onChange='Liferay.Search.FacetUtil.changeSelection(event);'
							type="checkbox"
						/>

						<span class="custom-control-label term-name ${(customRangeBucketDisplayContext.isSelected())?then('facet-term-selected', 'facet-term-unselected')}">
							<span class="custom-control-label-text">
								<#if customRangeBucketDisplayContext.isSelected()>
									<strong><@liferay_ui["message"] key="${htmlUtil.escape(customRangeBucketDisplayContext.getBucketText())}" /></strong>
								<#else>
									<@liferay_ui["message"] key="${htmlUtil.escape(customRangeBucketDisplayContext.getBucketText())}" />
								</#if>
							</span>
						</span>

						<#if customRangeBucketDisplayContext.isSelected()>
							<small class="term-count">
								(${customRangeBucketDisplayContext.getFrequency()})
							</small>
						</#if>
					</label>
				</div>
			</li>

			<div class="${(!dateFacetCalendarDisplayContext.isSelected())?then("hide", "")} date-custom-range" id="${namespace}customRange">
				<div class="col-md-6" id="${namespace}customRangeFrom">
					<div class="form-group">
						<label for="${namespace}customRangeFrom">From</label>

						<input
							class="form-control"
							id='${namespace}fromInput'
							value=""
							type="text"
						/>
					</div>
				</div>

				<div class="col-md-6" id="${namespace}customRangeTo">
					<div class="form-group">
						<label for="${namespace}customRangeFrom">To</label>

						<input
							class="form-control"
							id='${namespace}toInput'
							value=""
							type="text"
						/>
					</div>
				</div>

				<div class="c-mt-4 c-mb-4">
					<div class="double_range_slider">
						<span class="range_track" id="range_track"></span>

						<input type="range" class="min" min="0" max="100" value="0" step="0" />

						<input type="range" class="max" min="0" max="100" value="20" step="0" />
					</div>
				</div>

				<@clay["button"]
					cssClass="date-facet-custom-range-filter-button"
					disabled=dateFacetCalendarDisplayContext.isRangeBackwards()
					displayType="secondary"
					id="${namespace + 'searchCustomRangeButton'}"
					label="search"
					name="${namespace + 'searchCustomRangeButton'}"
				/>
			</div>
		</ul>
	</@>
</@>

<style>
	.double_range_slider {
		height: 0.25rem;
		background-color: #f1f2f5;
		border-radius: 100px;
		position: relative;
		width: 100%;
	}

	.range_track {
		height: 100%;
		position: absolute;
		border-radius: 100px;
		background-color: #0b5fff;
	}

	.double_range_slider input {
		position: absolute;
		width: 100%;
		height: 5px;
		background: none;
		pointer-events: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		top: 50%;
		transform: translateY(-50%);
	}

	.double_range_slider input::-webkit-slider-thumb {
		height: 1.5rem;
		width: 1.5rem;
		border-radius: 100px;
		border-width: 0px;
		box-shadow: 0 1px 5px -1px rgba(0, 0, 0, 0.3);
		background-color: #fff;
		pointer-events: auto;
		-webkit-appearance: none;
		cursor: pointer;
		margin-bottom: 1px;
	}

	.double_range_slider input::-moz-range-thumb {
		height: 1.5rem;
		width: 1.5rem;
		border-radius: 100px;
		border-width: 0px;
		box-shadow: 0 1px 5px -1px rgba(0, 0, 0, 0.3);
		background-color: #fff;
		pointer-events: auto;
		-moz-appearance: none;
		cursor: pointer;
		margin-top: 30%;
	}
</style>

<script>
	let minRangeValueGap = 0;
	const range = document.getElementById('range_track');
	const rangeInput = document.querySelectorAll(
		".double_range_slider input[type='range']"
	);
	const fromInput = document.getElementById(`${namespace}fromInput`);
	const toInput = document.getElementById(`${namespace}toInput`);

	let minRange, maxRange, minPercentage, maxPercentage;

	const minRangeFill = () => {
		range.style.left =
			(rangeInput[0].value / rangeInput[0].max) * 100 + '%';
	};
	const maxRangeFill = () => {
		range.style.right =
			100 - (rangeInput[1].value / rangeInput[1].max) * 100 + '%';
	};

	const setMinValueOutput = () => {
		minRange = parseInt(rangeInput[0].value);
	};
	const setMaxValueOutput = () => {
		maxRange = parseInt(rangeInput[1].value);
	};

	setMinValueOutput();
	setMaxValueOutput();
	minRangeFill();
	maxRangeFill();

	rangeInput.forEach((input) => {
		input.addEventListener('input', (e) => {
			setMinValueOutput();
			setMaxValueOutput();

			minRangeFill();
			maxRangeFill();

			if (maxRange - minRange < minRangeValueGap) {
				if (e.target.className === 'min') {
					rangeInput[0].value = maxRange - minRangeValueGap;
					setMinValueOutput();
					minRangeFill();
					e.target.style.zIndex = '2';
				} else {
					rangeInput[1].value = minRange + minRangeValueGap;
					e.target.style.zIndex = '2';
					setMaxValueOutput();
					maxRangeFill();
				}
			}

			fromInput.value = rangeInput[0].value;
			toInput.value = rangeInput[1].value;
		});
	});
</script>