/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayDropDown from '@clayui/drop-down';
import ClayForm, {ClayToggle} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayList from '@clayui/list';
import ClaySticker from '@clayui/sticker';
import {ClayTooltipProvider} from '@clayui/tooltip';
import getCN from 'classnames';
import React, {useContext, useEffect, useState} from 'react';

import {DEFAULT_SXP_ELEMENT_ICON} from '../../utils/data';
import isDefined from '../../utils/functions/is_defined';
import cleanUIConfiguration from '../../utils/sxp_element/clean_ui_configuration';
import getSXPElementTitleAndDescription from '../../utils/sxp_element/get_sxp_element_title_and_description';
import getUnifiedQuerySXPElementJSON from '../../utils/sxp_element/get_unified_query_sxp_element_json';
import isElementInactiveFromNonCompanyIndex from '../../utils/sxp_element/is_element_inactive_from_noncompany_index';
import {PreviewModalWithCopyDownload} from '../PreviewModal';
import ThemeContext from '../ThemeContext';
import DraggableInputs from './DraggableInputs';

/**
 * Converts the searchable types to be compatible with ClaySelect options prop.
 * @param {Array} searchableTypes Searchable types array from the EditSXPBlueprintDisplayBuilder
 * @returns {Array}
 */
const convertSearchableTypesToSelectOptions = (searchableTypes) => {
	return searchableTypes.map(({className, displayName}) => ({
		label: displayName,
		value: className,
	}));
};

function SXPUnifiedQueryElement({
	collapseAll,
	entityJSON,
	error = {},
	id,
	index,
	indexFields = [],
	isIndexCompany,
	isSubmitting,
	onBlur = () => {},
	onChange = () => {},
	onDeleteSXPElement,
	prefixedId,
	searchableTypes = [],
	setFieldTouched = () => {},
	setFieldValue = () => {},
	sxpElement,
	touched = {},
	uiConfigurationValues,
}) {
	const {locale} = useContext(ThemeContext);

	const [collapse, setCollapse] = useState(false);
	const [active, setActive] = useState(false);

	const [title, description] = getSXPElementTitleAndDescription(
		sxpElement,
		locale
	);

	const fieldSets = cleanUIConfiguration(
		sxpElement.elementDefinition?.uiConfiguration
	).fieldSets;

	useEffect(() => {
		setCollapse(collapseAll);
	}, [collapseAll]);

	const _getInputId = (sxpElementId, configKey) => {
		return `${sxpElementId}_${configKey}`;
	};

	const _getInputName = (configKey) => {
		return `elementInstances[${index}].uiConfigurationValues.${configKey}`;
	};

	const _isEnabled = () => {
		const enabled =
			sxpElement.elementDefinition?.configuration?.queryConfiguration
				?.queryEntries?.[0]?.enabled;

		return isDefined(enabled) ? enabled : true;
	};

	const _handleDelete = () => {
		onDeleteSXPElement(id);
	};

	const _handleToggle = () => {
		setFieldValue(
			`elementInstances[${index}].sxpElement.elementDefinition.` +
				`configuration.queryConfiguration.queryEntries[0].enabled`,
			!_isEnabled()
		);
	};

	const _hasError = (config) =>
		touched.uiConfigurationValues?.[config.name] &&
		!!error.uiConfigurationValues?.[config.name];

	return (
		<div
			className={getCN('sxp-element', 'sheet', {
				disabled:
					!_isEnabled() ||
					isElementInactiveFromNonCompanyIndex(
						isIndexCompany,
						sxpElement
					),
			})}
			id={prefixedId}
		>
			<ClayList className="configuration-header-list">
				<ClayList.Item flex>
					<ClayList.ItemField>
						<ClaySticker size="md">
							<ClayIcon
								symbol={
									sxpElement.elementDefinition?.icon ||
									DEFAULT_SXP_ELEMENT_ICON
								}
							/>
						</ClaySticker>
					</ClayList.ItemField>

					<ClayList.ItemField expand>
						{title && (
							<ClayList.ItemTitle>{title}</ClayList.ItemTitle>
						)}

						{description && (
							<ClayList.ItemText subtext={true}>
								{description}
							</ClayList.ItemText>
						)}
					</ClayList.ItemField>

					{isElementInactiveFromNonCompanyIndex(
						isIndexCompany,
						sxpElement
					) ? (
						<ClayTooltipProvider>
							<div
								data-tooltip-align="top"
								title={Liferay.Language.get(
									'query-element-inactive-from-index-help'
								)}
							>
								<ClayToggle
									aria-disabled="true"
									toggled={false}
								/>
							</div>
						</ClayTooltipProvider>
					) : (
						<ClayToggle
							aria-label={
								_isEnabled()
									? Liferay.Language.get('enabled')
									: Liferay.Language.get('disabled')
							}
							onToggle={_handleToggle}
							toggled={_isEnabled()}
						/>
					)}

					<ClayDropDown
						active={active}
						alignmentPosition={3}
						onActiveChange={setActive}
						trigger={
							<ClayList.ItemField>
								<ClayButton
									aria-label={Liferay.Language.get(
										'dropdown'
									)}
									borderless
									displayType="secondary"
									monospaced
									small
								>
									<ClayIcon symbol="ellipsis-v" />
								</ClayButton>
							</ClayList.ItemField>
						}
					>
						<ClayDropDown.ItemList>
							<PreviewModalWithCopyDownload
								fileName="sxpElement.json"
								size="lg"
								text={JSON.stringify(
									getUnifiedQuerySXPElementJSON(
										sxpElement,
										uiConfigurationValues
									),
									null,
									'\t'
								)}
								title={Liferay.Language.get('element-json')}
							>
								<ClayDropDown.Item>
									{Liferay.Language.get('view-element-json')}
								</ClayDropDown.Item>
							</PreviewModalWithCopyDownload>

							{onDeleteSXPElement && (
								<ClayDropDown.Item onClick={_handleDelete}>
									{Liferay.Language.get('remove')}
								</ClayDropDown.Item>
							)}
						</ClayDropDown.ItemList>
					</ClayDropDown>

					{!!fieldSets.length && (
						<ClayList.ItemField>
							<ClayButton
								aria-label={
									!collapse
										? Liferay.Language.get('collapse')
										: Liferay.Language.get('expand')
								}
								borderless
								displayType="secondary"
								monospaced
								onClick={() => {
									setCollapse(!collapse);
								}}
								small
							>
								<ClayIcon
									symbol={
										!collapse ? 'angle-down' : 'angle-right'
									}
								/>
							</ClayButton>
						</ClayList.ItemField>
					)}
				</ClayList.Item>
			</ClayList>

			{!collapse && !!fieldSets.length && (
				<div className="c-ml-2 c-mr-2">
					<DraggableInputs />
				</div>
			)}
		</div>
	);
}

export default React.memo(SXPUnifiedQueryElement);
