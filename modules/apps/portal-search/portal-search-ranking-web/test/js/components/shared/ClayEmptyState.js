import ClayEmptyState from 'components/shared/ClayEmptyState';
import React from 'react';
import {cleanup, render} from '@testing-library/react';

describe('ClayEmptyState', () => {
	it('should render', () => {
		const {asFragment} = render(<ClayEmptyState />);

		expect(asFragment()).toMatchSnapshot();
	});

	it('should display a custom title', () => {
		const {getByText} = render(<ClayEmptyState title='Test Title' />);

		expect(getByText('Test Title')).toBeInTheDocument();
	});

	it('should display a custom description', () => {
		const {getByText} = render(
			<ClayEmptyState description='Test Description' />
		);

		expect(getByText('Test Description')).toBeInTheDocument();
	});
});
