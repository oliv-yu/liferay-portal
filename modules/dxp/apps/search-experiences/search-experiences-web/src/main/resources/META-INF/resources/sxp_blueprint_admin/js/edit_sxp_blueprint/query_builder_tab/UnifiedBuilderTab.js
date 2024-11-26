/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayLayout from '@clayui/layout';
import ClayPanel from '@clayui/panel';
import {ClayTooltipProvider} from '@clayui/tooltip';
import React from 'react';

import {SIDEBAR_TYPES} from '../../utils/types/sidebarTypes';
import UnifiedQuerySXPElements from './UnifiedQuerySXPElements';

function SheetWrapper({children, description, helpText, title}) {
	return (
		<div className="c-mb-sm-3 sheet">
			<ClayPanel
				collapsable
				collapseHeaderClassNames="border-0 c-pt-0"
				defaultExpanded={true}
				displayTitle={
					<ClayPanel.Title>
						<div className="c-mb-0 sheet-title">
							{title}

							{!!helpText && (
								<ClayTooltipProvider>
									<span
										data-tooltip-align="bottom-left"
										title={helpText}
									>
										<ClayIcon
											className="c-ml-2 text-3 text-secondary"
											symbol="question-circle-full"
										/>
									</span>
								</ClayTooltipProvider>
							)}
						</div>
					</ClayPanel.Title>
				}
				displayType="unstyled"
				showCollapseIcon={true}
			>
				<ClayPanel.Body>
					{!!description && (
						<div className="sheet-text">{description}</div>
					)}

					{children}
				</ClayPanel.Body>
			</ClayPanel>
		</div>
	);
}

export default function UnifiedBuilderTab({
	applyIndexerClauses,
	clauseContributorsList = [],
	elementInstances,
	entityJSON,
	errors = [],
	frameworkConfig = {},
	isSubmitting,
	indexFields,
	isIndexCompany,
	onApplyIndexerClausesChange,
	onBlur,
	onChange,
	onDeleteSXPElement,
	onFetchSearchableTypes,
	onFrameworkConfigChange,
	searchableTypes = [],
	setFieldTouched,
	setFieldValue,
	openSidebar,
	setOpenSidebar,
	touched = [],
}) {

	/**
	 * Handles sidebar visibility. If 'visible' is not provided, sidebar
	 * will toggle between open or closed.
	 * @param {string} type A `SIDEBAR_TYPES` value.
	 * @param {visible} boolean Defaults to false if sidebar is open.
	 */
	const _handleChangeSidebarVisibility =
		(type) =>
		(visible = openSidebar !== type) => {
			if (visible) {
				setOpenSidebar(type);
			}
			else if (openSidebar === type) {
				setOpenSidebar('');
			}
		};

	return (
		<ClayLayout.ContainerFluid
			className="layout-section-main query-builder-tab"
			size="xl"
		>
			<SheetWrapper
				description={Liferay.Language.get('scope-description')}
				helpText={Liferay.Language.get('scope-help')}
				title={Liferay.Language.get('scope')}
			>
				<ClayButton displayType="secondary">
					<span className="inline-item inline-item-before">
						<ClayIcon onClick={() => {}} symbol="plus" />
					</span>

					{Liferay.Language.get('select-site-or-asset-library')}
				</ClayButton>
			</SheetWrapper>

			<SheetWrapper
				description={Liferay.Language.get('source-description')}
				helpText={Liferay.Language.get('source-help')}
				title={Liferay.Language.get('source')}
			>
				<ClayButton displayType="secondary">
					<span className="inline-item inline-item-before">
						<ClayIcon onClick={() => {}} symbol="plus" />
					</span>

					{Liferay.Language.get('select-types')}
				</ClayButton>
			</SheetWrapper>

			<UnifiedQuerySXPElements
				elementInstances={elementInstances}
				entityJSON={entityJSON}
				errors={errors}
				indexFields={indexFields}
				isIndexCompany={isIndexCompany}
				isSubmitting={isSubmitting}
				onBlur={onBlur}
				onChange={onChange}
				onChangeAddSXPElementVisibility={_handleChangeSidebarVisibility(
					SIDEBAR_TYPES.ADD_SXP_ELEMENT
				)}
				onDeleteSXPElement={onDeleteSXPElement}
				searchableTypes={searchableTypes}
				setFieldTouched={setFieldTouched}
				setFieldValue={setFieldValue}
				touched={touched}
			/>
		</ClayLayout.ContainerFluid>
	);
}
