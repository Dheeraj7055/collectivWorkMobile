import React from 'react';
import { View, Text, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Dropdown } from 'react-native-element-dropdown';

interface AudienceDropdownProps {
  selectAll: boolean;
  sectionSelection: string | null;
  handleSelectAllChange: (val: boolean) => void;
  setSectionSelection: (val: string | null) => void; // allow null
}

const audienceOptions = [
  { label: 'All Users', value: 'all' },
  { label: 'Departments', value: 'departments' },
  { label: 'Individuals', value: 'individuals' },
];

const AudienceDropdown: React.FC<AudienceDropdownProps> = ({
  selectAll,
  sectionSelection,
  handleSelectAllChange,
  setSectionSelection,
}) => {
  // use the dropdown's onChange too (tap outside checkbox)
  const handleDropdownChange = (item: { label: string; value: string }) => {
    if (item.value === 'all') {
      handleSelectAllChange(!selectAll);
      // when selecting "All", clear specific selection
      setSectionSelection(null);
    } else {
      handleSelectAllChange(false);
      setSectionSelection(item.value);
    }
  };

  const renderAllRow = () => {
    const onToggle = () => {
      handleSelectAllChange(!selectAll);
      setSectionSelection(null);
    };
    return (
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 15
        }}
        hitSlop={8}
      >
        <CheckBox value={selectAll} onValueChange={onToggle} style={{ height: 25}}/>
        <Text style={{ marginLeft: 4 }}>All Users</Text>
      </Pressable>
    );
  };

  const renderOptionRow = (itemValue: string, label: string) => {
    const checked = selectAll || sectionSelection === itemValue;
    const onToggle = () => {
      if (selectAll) return; // locked when "All" is selected
      setSectionSelection(checked ? null : itemValue);
    };
    return (
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
           paddingHorizontal: 15
        }}
        hitSlop={8}
      >
        <CheckBox value={checked} onValueChange={onToggle} style={{ height: 25}}/>
        <Text style={{ marginLeft: 4 }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <Dropdown
      style={{
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        borderColor: '#ccc',
      }}
      data={audienceOptions}
      labelField="label"
      valueField="value"
      placeholder="Select Audience"
      // show 'all' if selectAll is true; else show sectionSelection
      value={selectAll ? 'all' : sectionSelection}
      onChange={handleDropdownChange}
      renderItem={(item: { label: string; value: string }) => {
        if (item.value === 'all') return renderAllRow();
        return renderOptionRow(item.value, item.label);
      }}
    />
  );
};

export default AudienceDropdown;
