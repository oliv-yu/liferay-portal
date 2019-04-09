import React from 'react';
import PageToolbar from 'components/PageToolbar.es';
import {cleanup, fireEvent, render} from 'react-testing-library';
import 'jest-dom/extend-expect';

describe(
	'Pagetoolbar',
	() => {
		afterEach(cleanup);

		it(
			'should disable the publish button',
			() => {

				const {getByText} = render(
					<PageToolbar
						onCancel={'cancel'}
						submitDisabled={true}
					/>
				);

				expect(getByText('publish', {exact: false})).toHaveAttribute('disabled');
			}
		);

		it(
			'should enable the publish button',
			() => {

				const {getByText} = render(
					<PageToolbar
						onCancel={'cancel'}
						submitDisabled={false}
					/>
				);

				expect(getByText('publish', {exact: false})).not.toHaveAttribute('disabled');
			}
		);
	}
);