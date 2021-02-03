/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import {ClayInput} from '@clayui/form';
import React from 'react';

import {replaceStr} from '../../utils/utils';

function TextInput({configKey, disabled, id, label, onChange, value}) {
	return (
		<ClayInput.Group small>
			<ClayInput.GroupItem prepend>
				<ClayInput
					aria-label={label}
					disabled={disabled}
					id={id}
					onChange={(event) =>
						onChange(
							configKey,
							replaceStr(event.target.value, '"', '')
						)
					}
					value={value}
				/>
			</ClayInput.GroupItem>
		</ClayInput.Group>
	);
}

export default TextInput;
