import AddResult from 'components/add_result/AddResult';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {FETCH_VISIBLE_DOCUMENTS_URL} from 'test/mock-data.js';
import {
	cleanup,
	fireEvent,
	render,
	wait,
	waitForElement,
	within
} from '@testing-library/react';

jest.mock('utils/api');
jest.mock('react-dnd', () => ({
	DragSource: el => el => el,
	DropTarget: el => el => el
}));

const MODAL_ID = 'add-result-modal';
const RESULTS_LIST_ID = 'add-result-items';

describe('AddResult', () => {
	/*
	Console error occurs when React state should be wrapped in 'act',
	link for reference.
	https://github.com/testing-library/react-testing-library/issues/281#issuecomment-480349256
	 */
	const originalError = console.error;

	beforeAll(() => {
		console.error = (...args) => {
			if (
				/Warning.*not wrapped in act/.test(args[0]) ||
				/Warning: Can't perform a React state update/.test(args[0])
			) {
				return;
			}
			originalError.call(console, ...args);
		};
	});

	afterAll(() => {
		console.error = originalError;
	});

	it('should show a modal when the add a result button gets clicked', async () => {
		const {getByText, queryByTestId} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={jest.fn()}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		await wait(() => {
			expect(queryByTestId(MODAL_ID)).toBeInTheDocument();
		});
	});

	it('should close the modal when the cancel button gets clicked', async () => {
		const {getByTestId, getByText, queryByTestId} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={jest.fn()}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		await wait(() => {
			expect(queryByTestId(MODAL_ID)).toBeInTheDocument();
		});

		fireEvent.click(within(getByTestId(MODAL_ID)).getByText('Cancel'));

		await wait(() => {
			expect(queryByTestId(MODAL_ID)).not.toBeInTheDocument();
		});
	});

	it('should prompt a message to search in the modal', () => {
		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={jest.fn()}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		expect(modal.querySelector('.empty-state-title')).toHaveTextContent(
			'Search your engine'
		);

		expect(
			modal.querySelector('.empty-state-description')
		).toHaveTextContent('Search your engine to display results.');
	});

	it('should not show the prompt in the modal after enter key is pressed', async () => {
		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={jest.fn()}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		const input = modal.querySelector('.form-control');

		fireEvent.change(input, {target: {value: 'test'}});

		fireEvent.keyDown(input, {key: 'Enter', keyCode: 13, which: 13});

		await waitForElement(() => getByTestId(RESULTS_LIST_ID));

		expect(
			modal.querySelector('.empty-state-title')
		).not.toBeInTheDocument();
		expect(
			modal.querySelector('.empty-state-description')
		).not.toBeInTheDocument();
	});

	it('should show the results in the modal after enter key is pressed', async () => {
		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={jest.fn()}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		const input = modal.querySelector('.form-control');

		fireEvent.change(input, {target: {value: 'test'}});

		fireEvent.keyDown(input, {key: 'Enter', keyCode: 13, which: 13});

		await waitForElement(() => getByTestId(RESULTS_LIST_ID));

		expect(modal).toHaveTextContent('300 This is a Document Example');
		expect(modal).toHaveTextContent('309 This is a Web Content Example');
	});

	it('should call the onAddResultSubmit function after add is pressed', async () => {
		const onAddResultSubmit = jest.fn();

		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={onAddResultSubmit}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		const input = modal.querySelector('.form-control');

		fireEvent.change(input, {target: {value: 'test'}});

		fireEvent.keyDown(input, {key: 'Enter', keyCode: 13, which: 13});

		await waitForElement(() => getByTestId(RESULTS_LIST_ID));

		fireEvent.click(
			getByTestId('300').querySelector('.custom-control-input')
		);

		fireEvent.click(getByText('Add'));

		expect(onAddResultSubmit.mock.calls.length).toBe(1);
	});

	it('should show next page results in the modal after navigation is pressed', async () => {
		const onAddResultSubmit = jest.fn();

		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={onAddResultSubmit}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		const input = modal.querySelector('.form-control');

		fireEvent.change(input, {target: {value: 'test'}});

		fireEvent.keyDown(input, {key: 'Enter', keyCode: 13, which: 13});

		await waitForElement(() => getByTestId(RESULTS_LIST_ID));

		fireEvent.click(modal.querySelector('.page-item-next a'));

		await waitForElement(() => getByTestId('310'));

		expect(modal).not.toHaveTextContent('300 This is a Document Example');
		expect(modal).not.toHaveTextContent(
			'309 This is a Web Content Example'
		);
		expect(modal).toHaveTextContent('310 This is a Document Example');
		expect(modal).toHaveTextContent('319 This is a Web Content Example');
	});

	it('should update results count in the modal after page delta is pressed', async () => {
		const onAddResultSubmit = jest.fn();

		const {getByTestId, getByText} = render(
			<AddResult
				fetchDocumentsUrl={FETCH_VISIBLE_DOCUMENTS_URL}
				onAddResultSubmit={onAddResultSubmit}
			/>
		);

		fireEvent.click(getByText('Add a Result'));

		const modal = getByTestId(MODAL_ID);

		const input = modal.querySelector('.form-control');

		fireEvent.change(input, {target: {value: 'test'}});

		fireEvent.keyDown(input, {key: 'Enter', keyCode: 13, which: 13});

		await waitForElement(() => getByTestId(RESULTS_LIST_ID));

		fireEvent.click(getByText('50'));

		await waitForElement(() => getByTestId('349'));

		expect(modal).toHaveTextContent('349 This is a Web Content Example');
	});
});
