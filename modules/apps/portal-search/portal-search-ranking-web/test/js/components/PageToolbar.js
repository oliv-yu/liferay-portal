import React from 'react';
import PageToolbar from 'components/PageToolbar.e';
import {cleanup, render} from '@testing-library/react';

describe('PageToolbar', () => {
	it('should disable the publish button', () => {
		const {getByText} = render(
			<PageToolbar
				onCancel={'cancel'}
				onPublish={jest.fn()}
				submitDisabled={true}
			/>
		);

		expect(getByText('Publish')).toHaveAttribute('disabled');
	});

	it('should enable the publish button', () => {
		const {getByText} = render(
			<PageToolbar
				onCancel={'cancel'}
				onPublish={jest.fn()}
				submitDisabled={false}
			/>
		);

		expect(getByText('Publish')).not.toHaveAttribute('disabled');
	});
});
