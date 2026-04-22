/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {Option, Picker} from '@clayui/core';
import {ClayInput} from '@clayui/form';
import classNames from 'classnames';
import React, {MutableRefObject, useEffect, useRef, useState} from 'react';

import RuleField from './RuleField';

const TriggerLabel = React.forwardRef<HTMLButtonElement, any>(
	(
		{children, className: _className, onClick, triggerRef, ...otherProps},
		ref
	) => {
		useEffect(() => {
			if (ref && triggerRef) {

				// @ts-ignore
				// False positive - react-compiler/react-compiler
				// eslint-disable-next-line react-compiler/react-compiler
				triggerRef.current = ref.current;
			}
		});

		return (
			<ClayButton
				className={classNames(
					'form-control form-control-select form-control-sm'
				)}
				displayType="secondary"
				onClick={onClick}
				ref={ref}
				size="sm"
				{...otherProps}
			>
				{children}
			</ClayButton>
		);
	}
);

interface RuleSelectProps<T> {
	'aria-label'?: string;
	'fieldId': string;
	'items': Array<{id: string; label: string}>;
	'onSelectionChange'?: (selection: T) => void;
	'readOnly'?: boolean;
	'selectedKey'?: string;
	'triggerRef'?: MutableRefObject<HTMLButtonElement | undefined>;
}

export default function RuleSelect<T extends string>({
	'aria-label': label = '',
	fieldId,
	items,
	onSelectionChange,
	readOnly,
	selectedKey,
	triggerRef,
	...otherProps
}: RuleSelectProps<T>) {
	const [hasError, setHasError] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const fieldRef = inputRef || triggerRef;

	if (readOnly) {
		const item = items.find(({id}) => id === selectedKey);

		return (
			<ClayInput
				aria-label={item?.label}
				className="w-auto"
				readOnly
				sizing="sm"
				value={item?.label}
			/>
		);
	}

	return (
		<RuleField
			className="mb-0 w-50"
			errorMessage={label}
			fieldId={fieldId}
			hasError={hasError}
		>
			{items.length ? (
				<Picker
					aria-label={label}
					as={TriggerLabel}
					items={items}
					key={selectedKey === undefined ? 0 : 1}
					messages={{
						itemDescribedby: Liferay.Language.get(
							'you-are-currently-on-a-text-element,-inside-of-a-list-box'
						),
						itemSelected: Liferay.Language.get('x-selected'),
						scrollToBottomAriaLabel:
							Liferay.Language.get('scroll-to-bottom'),
						scrollToTopAriaLabel:
							Liferay.Language.get('scroll-to-top'),
					}}
					onSelectionChange={(selection: React.Key) => {
						onSelectionChange?.(selection as T);

						setHasError(false);
					}}
					placeholder={Liferay.Language.get('select')}
					selectedKey={selectedKey}
					triggerRef={fieldRef}
					{...(hasError && {'aria-describedby': `${fieldId}-error`})}
					{...otherProps}
				>
					{(item) => <Option key={item.id}>{item.label}</Option>}
				</Picker>
			) : (
				<ClayInput
					aria-label={label}
					className="w-auto"
					readOnly
					ref={inputRef}
					sizing="sm"
					value={Liferay.Language.get('no-options-available')}
					{...(hasError && {'aria-describedby': `${fieldId}-error`})}
				/>
			)}
		</RuleField>
	);
}
