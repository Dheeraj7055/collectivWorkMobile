import React from "react";
import { View, Text } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { Dropdown } from "react-native-element-dropdown";

interface AudienceDropdownProps {
  selectAll: boolean;
  sectionSelection: string | null;
  handleSelectAllChange: (val: boolean) => void;
  setSectionSelection: (val: string) => void;
}

const audienceOptions = [
  { label: "All Users", value: "all" },
  { label: "Departments", value: "departments" },
  { label: "Individuals", value: "individuals" },
];

const AudienceDropdown: React.FC<AudienceDropdownProps> = ({
  selectAll,
  sectionSelection,
  handleSelectAllChange,
  setSectionSelection,
}) => {
  return (
    // <Dropdown
    //   style={{
    //     height: 50,
    //     borderWidth: 1,
    //     borderRadius: 8,
    //     paddingHorizontal: 10,
    //     borderColor: "#ccc",
    //   }}
    //   data={audienceOptions}
    //   labelField="label"
    //   valueField="value"
    //   placeholder="Select Audience"
    //   value={sectionSelection || (selectAll ? "all" : null)}
    //   onChange={() => {}} // not used
    //   renderItem={(item) => {
    //     if (item.value === "all") {
    //       return (
    //         <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
    //           <CheckBox value={selectAll} onValueChange={handleSelectAllChange} />
    //           <Text style={{ marginLeft: 8 }}>{item.label}</Text>
    //         </View>
    //       );
    //     }

    //     return (
    //       <View
    //         style={{
    //           flexDirection: 'row',
    //           alignItems: 'center',
    //           paddingVertical: 10,
    //         }}
    //       >
    //         <CheckBox
    //           value={sectionSelection === item.value}
    //           onValueChange={() => {
    //             setSectionSelection(
    //               sectionSelection === item.value ? null : item.value,
    //             );
    //           }}
    //         />
    //         <Text style={{ marginLeft: 8 }}>{item.label}</Text>
    //       </View>
    //     );
    //   }}
    // />
    <Dropdown
      style={{
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        borderColor: '#ccc',
      }}
      data={audienceOptions}
      labelField="label"
      valueField="value"
      placeholder="Select Audience"
      value={sectionSelection || (selectAll ? 'all' : null)}
      onChange={() => {}}
      renderItem={item => {
        if (item.value === 'all') {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
            >
              <CheckBox
                value={selectAll}
                onValueChange={handleSelectAllChange}
              />
              <Text style={{ marginLeft: 8 }}>{item.label}</Text>
            </View>
          );
        }

        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <CheckBox
              value={selectAll || sectionSelection === item.value}
              onValueChange={() => {
                if (selectAll) {
                  return;
                }
                setSectionSelection(
                  sectionSelection === item.value ? null : item.value,
                );
              }}
            />
            <Text style={{ marginLeft: 8 }}>{item.label}</Text>
          </View>
        );
      }}
    />
  );
};

export default AudienceDropdown;
