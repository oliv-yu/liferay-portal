/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ClayButtonWithIcon} from '@clayui/button';
import React, {KeyboardEventHandler, Ref} from 'react';

import RuleSelect from './RuleSelect';
import { RULES_MAP } from './Rules';

interface RuleBuilderItemProps {
	'index': number;
	'onDeleteButtonClick': () => void;
	'onItemSelected'?: () => void;
	'rule': Object;
	'showDeleteButton': boolean;
	'wrapperRef'?: Ref<HTMLDivElement>;
}

export default function RuleBuilderItem({
	index,
	onDeleteButtonClick,
	onItemSelected,
	showDeleteButton,
	wrapperRef,
	...otherProps
}: RuleBuilderItemProps) {
	const onKeyDown: KeyboardEventHandler = (event) => {
		if (event.target !== event.currentTarget) {
			return;
		}

		const items = Array.from<HTMLElement>(
			document.querySelectorAll(
				`.collections-rule-builder-item`
			)
		);

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();

			if (onItemSelected) {
			onItemSelected();
			}
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();

			const index = items.indexOf(event.target as HTMLElement);

			let nextIndex = index + 1;

			if (index === items.length - 1) {
				nextIndex = 0;
			}

			items[nextIndex]?.focus();
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();

			const index = items.indexOf(event.target as HTMLElement);

			let nextIndex = index - 1;

			if (index === 0) {
				nextIndex = items.length - 1;
			}

			items[nextIndex]?.focus();
		}
	};

	return (
		<div
			className="align-items-center d-flex justify-content-between mb-3 p-2"
			onKeyDown={onKeyDown}
			ref={wrapperRef}
			role="menuitem"
			tabIndex={0}
			{...otherProps}
		>
			<div className="c-gap-2 d-flex flex-grow-1 flex-wrap">
				<RuleSelect
					aria-label=""
					fieldId={`rule-${index}`}
					items={RULES_MAP.fields}
				/>
			</div>

			{showDeleteButton ? (
				<ClayButtonWithIcon
					aria-label={Liferay.Language.get('delete')}
					borderless
					className="align-self-baseline collections-rule-builder-delete-button lfr-portal-tooltip"
					displayType="secondary"
					onClick={onDeleteButtonClick}
					size="sm"
					symbol="times-circle"
					title={Liferay.Language.get('delete')}
				/>
			) : null}
		</div>
	);
}
