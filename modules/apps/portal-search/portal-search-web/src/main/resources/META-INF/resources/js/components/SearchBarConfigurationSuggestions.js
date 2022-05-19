/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {ClayInput, ClaySelect} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayMultiSelect from '@clayui/multi-select';
import React, {useState} from 'react';

import FieldList from './FieldList';

/**
 * Cleans up the fields array by removing those that do not have the required
 * fields (contributorName, displayGroupName, size). If blueprint, check
 * for blueprintKey as well.
 * @param {Array} fields The list of fields.
 * @return {Array} The cleaned up list of fields.
 */
const removeEmptyFields = (fields) =>
	fields.filter(({blueprintKey, contributorName, displayGroupName, size}) => {
		if (contributorName === 'basic') {
			return displayGroupName && size;
		}

		return contributorName && displayGroupName && size && blueprintKey;
	});

function Inputs({
	blueprintKey,
	displayGroupName,
	fields = [],
	includeAssetSummary,
	includeAssetURL,
	onChange,
	onReplace,
	size,
	contributorName,
}) {
	const [multiSelectValue, setMultiSelectValue] = useState('');
	const [multiSelectItems, setMultiSelectItems] = useState(
		fields.map((field) => ({
			label: field,
			value: field,
		}))
	);

	const _handleChangeValue = (value) => (event) => {
		onChange({[value]: event.target.value});
	};

	const _handleContributorNameChange = (event) => {
		if (event.target.value === 'basic') {
			onReplace({
				contributorName: event.target.value,
				displayGroupName,
				size,
			});
		}
		else {
			onChange({
				contributorName: event.target.value,
				displayGroupName,
				fields: [],
				includeAssetSummary: true,
				includeAssetURL: true,
				size,
			});
		}
	};

	return (
		<div className="input-group-item">
			<div
				className="form-group-autofit"
				style={{
					marginBottom: contributorName === 'basic' ? '0' : '1.5rem',
				}}
			>
				<ClayInput.GroupItem>
					<label>
						{Liferay.Language.get('suggestion-contributor')}

						<span className="reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>
					</label>

					<ClaySelect
						aria-label={Liferay.Language.get(
							'suggestion-contributor'
						)}
						onChange={_handleContributorNameChange}
						value={contributorName}
					>
						<ClaySelect.Option
							label={Liferay.Language.get('basic')}
							value="basic"
						/>

						<ClaySelect.Option
							label={Liferay.Language.get('blueprint')}
							value="blueprint"
						/>
					</ClaySelect>
				</ClayInput.GroupItem>

				<ClayInput.GroupItem>
					<label>
						{Liferay.Language.get('display-group-name')}

						<span className="reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>
					</label>

					<ClayInput
						onChange={_handleChangeValue('displayGroupName')}
						type="text"
						value={displayGroupName}
					/>
				</ClayInput.GroupItem>

				<ClayInput.GroupItem>
					<label>
						{Liferay.Language.get('size')}

						<span className="reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>
					</label>

					<ClaySelect
						aria-label={Liferay.Language.get('size')}
						onChange={_handleChangeValue('size')}
						value={size}
					>
						{[1, 2, 3, 4, 5].map((number) => (
							<ClaySelect.Option
								key={number}
								label={number}
								value={number}
							/>
						))}
					</ClaySelect>
				</ClayInput.GroupItem>
			</div>

			{contributorName === 'blueprint' && (
				<>
					<div className="form-group-autofit">
						<ClayInput.GroupItem>
							<label>
								{Liferay.Language.get('blueprint-key')}

								<span className="reference-mark">
									<ClayIcon symbol="asterisk" />
								</span>
							</label>

							<ClayInput
								onChange={_handleChangeValue('blueprintKey')}
								type="text"
								value={blueprintKey}
							/>
						</ClayInput.GroupItem>

						<ClayInput.GroupItem>
							<label>
								{Liferay.Language.get('include-asset-url')}
							</label>

							<ClaySelect
								aria-label={Liferay.Language.get(
									'include-asset-url'
								)}
								onChange={_handleChangeValue('includeAssetURL')}
								value={includeAssetURL}
							>
								<ClaySelect.Option
									label={Liferay.Language.get('true')}
									value={true}
								/>

								<ClaySelect.Option
									label={Liferay.Language.get('false')}
									value={false}
								/>
							</ClaySelect>
						</ClayInput.GroupItem>

						<ClayInput.GroupItem>
							<label>
								{Liferay.Language.get('include-asset-summary')}
							</label>

							<ClaySelect
								aria-label={Liferay.Language.get(
									'include-asset-summary'
								)}
								onChange={_handleChangeValue(
									'includeAssetSummary'
								)}
								value={includeAssetSummary}
							>
								<ClaySelect.Option
									label={Liferay.Language.get('true')}
									value={true}
								/>

								<ClaySelect.Option
									label={Liferay.Language.get('false')}
									value={false}
								/>
							</ClaySelect>
						</ClayInput.GroupItem>
					</div>

					<div
						className="form-group-autofit"
						style={{marginBottom: '0.5rem'}}
					>
						<ClayInput.GroupItem>
							<label>{Liferay.Language.get('fields')}</label>

							<ClayMultiSelect
								items={multiSelectItems}
								onChange={setMultiSelectValue}
								onItemsChange={(newValue) => {
									onChange({
										fields: newValue.map(
											(item) => item.value
										),
									});
									setMultiSelectItems(newValue);
								}}
								value={multiSelectValue}
							/>
						</ClayInput.GroupItem>
					</div>
				</>
			)}
		</div>
	);
}

function SearchBarConfigurationSuggestions({
	namespace = '',
	suggestionsContributorConfiguration = '[]',
	suggestionsContributorConfigurationName = '',
}) {
	const [fields, setFields] = useState(
		JSON.parse(suggestionsContributorConfiguration).map((field, index) => ({
			...field,
			id: index, // For FieldList item `key` when reordering.
		}))
	);

	return (
		<div className="search-bar-configuration-suggestions">
			<input
				hidden
				name={`${namespace}${suggestionsContributorConfigurationName}`}
				readOnly
				value={JSON.stringify(
					removeEmptyFields(fields).map(
						({id, ...properties}) => properties //eslint-disable-line
					)
				)}
			/>

			<FieldList
				addFieldLabel={Liferay.Language.get('add-contributor')}
				fields={fields}
				initialValue={{
					contributorName: 'basic',
					displayGroupName: '',
					size: 5,
				}}
				inputItems={(props) => <Inputs {...props} />}
				onChangeFields={setFields}
			/>
		</div>
	);
}

export default SearchBarConfigurationSuggestions;
