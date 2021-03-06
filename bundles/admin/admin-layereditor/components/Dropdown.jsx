import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown as AntDropdown } from 'antd';
import 'antd/es/dropdown/style/index.js';

export const Dropdown = ({ children, menu, click = true }) => (
    <AntDropdown overlay={menu} trigger={click ? ['click'] : ['hover']}>
        <a className="ant-dropdown-link" href="#">
            {children}
        </a>
    </AntDropdown>
);

Dropdown.propTypes = {
    children: PropTypes.element.isRequired,
    menu: PropTypes.any.isRequired,
    click: PropTypes.bool
};
