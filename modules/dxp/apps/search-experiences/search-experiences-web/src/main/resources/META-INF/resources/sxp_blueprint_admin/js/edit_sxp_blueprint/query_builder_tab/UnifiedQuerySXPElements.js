/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayPanel from '@clayui/panel';
import {ClayTooltipProvider} from '@clayui/tooltip';
import React, {useState} from 'react';

import JSONSXPElement from '../../shared/JSONSXPElement';
import SXPElement from '../../shared/sxp_element/index';
import SXPUnifiedQueryElement from '../../shared/sxp_unified_query_element';
import {SXP_ELEMENT_PREFIX} from '../../utils/constants';
import {setStorageAddSXPElementSidebar} from '../../utils/sessionStorage';
import isCustomJSONSXPElement from '../../utils/sxp_element/is_custom_json_sxp_element';
import isUnifiedQuerySXPElement from '../../utils/sxp_element/is_unified_query_sxp_element';

function UnifiedQuerySXPElements({
	elementInstances,
	entityJSON,
	errors = [],
	isIndexCompany,
	isSubmitting,
	indexFields,
	onBlur,
	onChange,
	onDeleteSXPElement,
	onChangeAddSXPElementVisibility,
	searchableTypes,
	setFieldTouched,
	setFieldValue,
	touched = [],
}) {
	const [collapseAll, setCollapseAll] = useState(false);

	const _handleClickAddQueryElement = (event) => {
		event.stopPropagation();

		setStorageAddSXPElementSidebar();

		onChangeAddSXPElementVisibility();
	};

	return (
		<div className="c-mb-sm-3 query-sxp-elements sheet">
			<ClayPanel
				collapsable
				collapseHeaderClassNames="border-0 c-pt-0"
				defaultExpanded={true}
				displayTitle={
					<ClayPanel.Title>
						<div className="d-flex justify-content-between">
							<div className="c-mb-0 sheet-title">
								{Liferay.Language.get('query-elements')}
							</div>

							<div className="builder-actions c-mr-3">
								<ClayButton
									aria-label={Liferay.Language.get(
										'collapse-all'
									)}
									borderless={true}
									className="c-mr-2"
									displayType="secondary"
									onClick={(event) => {
										event.stopPropagation();

										setCollapseAll(!collapseAll);
									}}
								>
									{collapseAll
										? Liferay.Language.get('expand-all')
										: Liferay.Language.get('collapse-all')}
								</ClayButton>

								<ClayTooltipProvider>
									<ClayButton
										aria-label={Liferay.Language.get(
											'add-query-element'
										)}
										displayType="primary"
										monospaced
										onClick={_handleClickAddQueryElement}
										size="sm"
										title={Liferay.Language.get(
											'add-query-element'
										)}
									>
										<ClayIcon symbol="plus" />
									</ClayButton>
								</ClayTooltipProvider>
							</div>
						</div>
					</ClayPanel.Title>
				}
				displayType="unstyled"
				showCollapseIcon={true}
			>
				<ClayPanel.Body>
					{!elementInstances.length ? (
						<div className="selected-sxp-elements-empty-text">
							{Liferay.Language.get(
								'add-query-elements-from-side-panel'
							)}
						</div>
					) : (
						elementInstances.map(
							(
								{id, sxpElement, uiConfigurationValues},
								index
							) => {
								return isUnifiedQuerySXPElement(
									uiConfigurationValues
								) ? (
									<SXPUnifiedQueryElement
										collapseAll={collapseAll}
										entityJSON={entityJSON}
										error={errors[index]}
										id={id}
										index={index}
										indexFields={indexFields}
										isIndexCompany={isIndexCompany}
										isSubmitting={isSubmitting}
										key={id}
										onBlur={onBlur}
										onChange={onChange}
										onDeleteSXPElement={onDeleteSXPElement}
										prefixedId={`${SXP_ELEMENT_PREFIX.QUERY}-${index}`}
										searchableTypes={searchableTypes}
										setFieldTouched={setFieldTouched}
										setFieldValue={setFieldValue}
										sxpElement={sxpElement}
										touched={touched[index]}
										uiConfigurationValues={
											uiConfigurationValues
										}
									/>
								) : isCustomJSONSXPElement(
										uiConfigurationValues
								  ) ? (
									<JSONSXPElement
										collapseAll={collapseAll}
										error={errors[index]}
										id={id}
										index={index}
										isSubmitting={isSubmitting}
										key={id}
										onDeleteSXPElement={onDeleteSXPElement}
										prefixedId={`${SXP_ELEMENT_PREFIX.QUERY}-${index}`}
										setFieldTouched={setFieldTouched}
										setFieldValue={setFieldValue}
										sxpElement={sxpElement}
										touched={touched[index]}
										uiConfigurationValues={
											uiConfigurationValues
										}
									/>
								) : (
									<SXPElement
										collapseAll={collapseAll}
										entityJSON={entityJSON}
										error={errors[index]}
										id={id}
										index={index}
										indexFields={indexFields}
										isIndexCompany={isIndexCompany}
										isSubmitting={isSubmitting}
										key={id}
										onBlur={onBlur}
										onChange={onChange}
										onDeleteSXPElement={onDeleteSXPElement}
										prefixedId={`${SXP_ELEMENT_PREFIX.QUERY}-${index}`}
										searchableTypes={searchableTypes}
										setFieldTouched={setFieldTouched}
										setFieldValue={setFieldValue}
										sxpElement={sxpElement}
										touched={touched[index]}
										uiConfigurationValues={
											uiConfigurationValues
										}
									/>
								);
							}
						)
					)}
				</ClayPanel.Body>
			</ClayPanel>
		</div>
	);
}

export default React.memo(UnifiedQuerySXPElements);
