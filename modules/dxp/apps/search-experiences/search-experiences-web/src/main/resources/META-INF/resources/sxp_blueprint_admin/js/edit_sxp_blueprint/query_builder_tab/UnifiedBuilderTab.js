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
import ScopeSelector from './ScopeSelector';
import SourceSelector from './SourceSelector';
import UnifiedQuerySXPElements from './UnifiedQuerySXPElements';

export default function UnifiedBuilderTab({
	applyIndexerClauses,
	clauseContributorsList = [],
	elementInstances,
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
		<ClayLayout.ContainerFluid className="layout-section-main" size="xl">
			<div className="layout-section-main-shift">
				<ScopeSelector />

				<SourceSelector />

				<UnifiedQuerySXPElements
					elementInstances={elementInstances}
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
			</div>
		</ClayLayout.ContainerFluid>
	);
}
