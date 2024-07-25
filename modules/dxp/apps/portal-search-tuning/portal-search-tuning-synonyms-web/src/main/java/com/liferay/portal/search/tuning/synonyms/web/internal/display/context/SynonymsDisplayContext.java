/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.tuning.synonyms.web.internal.display.context;

import com.liferay.frontend.taglib.clay.servlet.taglib.util.CreationMenu;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItem;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.LabelItem;
import com.liferay.portal.kernel.dao.search.SearchContainer;

import java.util.List;

/**
 * @author Filipe Oshiro
 */
public class SynonymsDisplayContext {

	public List<DropdownItem> getActionDropdownMultipleItems() {
		return _dropdownItems;
	}

	public String getClearResultsURL() {
		return _clearResultsURL;
	}

	public CreationMenu getCreationMenu() {
		return _creationMenu;
	}

	public List<DropdownItem> getFilterItemsDropdownItems() {
		return _filterItemsDropdownItems;
	}

	public List<LabelItem> getFilterLabelItems() {
		return _filterLabelItems;
	}

	public int getItemsTotal() {
		return _itemsTotal;
	}

	public SearchContainer<SynonymSetDisplayContext> getSearchContainer() {
		return _searchContainer;
	}

	public boolean isDisabledManagementBar() {
		return _disabledManagementBar;
	}

	public void setClearResultsURL(String clearResultsURL) {
		_clearResultsURL = clearResultsURL;
	}

	public void setCreationMenu(CreationMenu creationMenu) {
		_creationMenu = creationMenu;
	}

	public void setDisabledManagementBar(boolean disabledManagementBar) {
		_disabledManagementBar = disabledManagementBar;
	}

	public void setDropdownItems(List<DropdownItem> dropdownItems) {
		_dropdownItems = dropdownItems;
	}

	public void setFilterItemsDropdownItems(
		List<DropdownItem> filterItemsDropdownItems) {

		_filterItemsDropdownItems = filterItemsDropdownItems;
	}

	public void setFilterLabelItems(List<LabelItem> filterLabelItems) {
		_filterLabelItems = filterLabelItems;
	}

	public void setItemsTotal(int itemsTotal) {
		_itemsTotal = itemsTotal;
	}

	public void setSearchContainer(
		SearchContainer<SynonymSetDisplayContext> searchContainer) {

		_searchContainer = searchContainer;
	}

	private String _clearResultsURL;
	private CreationMenu _creationMenu;
	private boolean _disabledManagementBar;
	private List<DropdownItem> _dropdownItems;
	private List<DropdownItem> _filterItemsDropdownItems;
	private List<LabelItem> _filterLabelItems;
	private int _itemsTotal;
	private SearchContainer<SynonymSetDisplayContext> _searchContainer;

}