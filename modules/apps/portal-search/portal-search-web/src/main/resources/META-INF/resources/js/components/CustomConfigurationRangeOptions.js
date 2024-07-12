/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {ClayTooltipProvider} from '@clayui/tooltip';
import getCN from 'classnames';
import React from 'react';

import InputSets, {useInputSets} from '../shared/input_sets/index';

/**
 * Cleans up the ranges array by removing those that have empty indexed
 * range names or labels.
 * @param {Array} ranges The list of ranges.
 * @return {Array} The cleaned up list of ranges.
 */
const removeEmptyRanges = (ranges) =>
	ranges.filter(({label, range}) => !!range && !!label);

function Inputs({index, namespace, onInputSetItemChange, value}) {
	const _handleChangeValue = (property) => (event) => {
		onInputSetItemChange(index, {[property]: event.target.value});
	};

	return (
		<div className="input-group-item">
			<div className="c-mb-3 form-group-autofit">
				<ClayInput.GroupItem>
					<label htmlFor={`${namespace}_label_${index}`}>
						{Liferay.Language.get('label')}

						<span className="c-ml-1 reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>

						<ClayTooltipProvider>
							<span
								className="c-ml-2 text-secondary"
								data-title={Liferay.Language.get(
									'custom-configuration-label-help'
								)}
							>
								<ClayIcon symbol="question-circle-full" />
							</span>
						</ClayTooltipProvider>
					</label>

					<ClayInput
						id={`${namespace}_label_${index}`}
						onChange={_handleChangeValue('label')}
						required
						type="text"
						value={value.label || ''}
					/>
				</ClayInput.GroupItem>
			</div>

			<div className="c-mb-3 form-group-autofit">
				<ClayInput.GroupItem>
					<label htmlFor={`${namespace}_range_${index}`}>
						{Liferay.Language.get('range')}

						<span className="c-ml-1 reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>

						<ClayTooltipProvider>
							<span
								className="c-ml-2 text-secondary"
								data-title={Liferay.Language.get(
									'custom-configuration-range-help'
								)}
							>
								<ClayIcon symbol="question-circle-full" />
							</span>
						</ClayTooltipProvider>
					</label>

					<ClayInput
						id={`${namespace}_range_${index}`}
						onChange={_handleChangeValue('range')}
						required
						type="text"
						value={value.range || ''}
					/>
				</ClayInput.GroupItem>
			</div>
		</div>
	);
}

function CustomConfigurationRangeOptions({
	rangesInputName = 'ranges',
	rangesIndexInputName = 'rangesIndex',
	rangesJSONArray = [
		{label: 'past-hour', range: '[past-hour TO *]'},
		{label: 'past-24-hours', range: '[past-24-hours TO *]'},
		{label: 'past-week', range: '[past-week TO *]'},
		{label: 'past-month', range: '[past-month TO *]'},
		{label: 'past-year', range: '[past-year TO *]'},
	],
	namespace = '',
}) {
	const {
		getInputSetItemProps,
		onInputSetItemChange,
		onInputSetsAdd,
		onInputSetsChange,
		value: ranges,
	} = useInputSets(rangesJSONArray);

	return (
		<div className="sort-configurations-options">
			<InputSets>
				{ranges.map((valueItem, valueIndex) => (
					// eslint-disable-next-line react/jsx-key
					<InputSets.Item
						{...getInputSetItemProps(valueItem, valueIndex)}
					>
						<Inputs
							index={valueIndex}
							namespace={namespace}
							onInputSetItemChange={onInputSetItemChange}
							value={valueItem}
						/>
					</InputSets.Item>
				))}

				<ClayButton
					aria-label={Liferay.Language.get('add-range')}
					className={getCN({
						'c-mt-4': !ranges.length,
					})}
					displayType="secondary"
					onClick={onInputSetsAdd}
				>
					<span className="inline-item inline-item-before">
						<ClayIcon symbol="plus" />
					</span>

					{Liferay.Language.get('add-range')}
				</ClayButton>
			</InputSets>

			<input
				name={`${namespace}${rangesInputName}`}
				type="hidden"
				value={JSON.stringify(removeEmptyRanges(ranges))}
			/>

			<input
				name={`${namespace}${rangesIndexInputName}`}
				type="hidden"
				value={ranges.map((_, index) => index).join(',')}
			/>
		</div>
	);
}

export default CustomConfigurationRangeOptions;
