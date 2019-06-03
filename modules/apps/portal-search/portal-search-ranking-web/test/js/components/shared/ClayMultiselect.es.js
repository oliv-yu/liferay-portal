import ClayMultiselect from 'components/shared/ClayMultiselect.es';
import React from 'react';
import {cleanup, render} from '@testing-library/react';

describe('ClayMultiselect', () => {
	it('should render', () => {
		const {container} = render(<ClayMultiselect />);

		expect(container.firstChild).not.toBeNull();
	});
});
