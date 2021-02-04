import React, {useState, useEffect} from 'react';
import { Dropdown, DropdownList, DropdownListItem, Flex, Paragraph, Pill, TextInput} from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
  data: Data[];
}

interface Data {
  id: string;
  name: string;
}

interface WistiaItem {
  id:string,
  name: string
}

const Field = (props: FieldProps) => {
  const {data, sdk} = props;
  const [selectedIds, setIds] = useState<string[]>([])
  const [dropdownData, filterDropdownData] = useState<Data[]>([...data])
  sdk.window.startAutoResizer()

  // set inital state based on field values
  useEffect(() => {
    const fieldValues = sdk.field.getValue()
    setIds(fieldValues !== undefined && fieldValues.items.length > 0 ? fieldValues.items.map((item:any) => item.id):[])
  }, [sdk.field])

  // Function to update video ids
  const updateVideoIds = (id:any) => {
    const updatedIds = selectedIds.findIndex(selectedId => selectedId === id) === -1?
    [...selectedIds, id]:
    [...selectedIds.filter(selectedId => selectedId!== id)]

    setIds(updatedIds);
    
    setNewValues(updatedIds);
  }
  
  // set field value with updated state
  const setNewValues = (updatedIds:string[]) => {
    sdk.field.setValue({items: data.filter((item => {
      return updatedIds.findIndex(updatedId => item.id === updatedId) !== -1
    }))})
  }

  const getDropdownData = (searchTerm:string) => {
    const newDropdownData = [...data].filter((item:Data) => {
      return item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    })

    return newDropdownData;
  }

  return (
    <Flex flexDirection={"column"} fullHeight={true} style={{minHeight: 500}}>
      {sdk.field.getValue() && sdk.field.getValue().items.length > 0 && (
        <Flex flexDirection={"column"} marginBottom={"spacingL"}>
          <Paragraph style={{marginBottom: 10}}>
            Selected Videos
          </Paragraph>
          <Flex flexWrap={"wrap"}>
            {sdk.field.getValue().items.map((item:WistiaItem) => (
              <Pill style={{width: 300, marginRight: 10, marginBottom: 10}} label={item.name} onClose={() => updateVideoIds(item.id)} key={item.id}/>
            ))}
          </Flex>
        </Flex>
      )}
      <Flex marginBottom={'spacingS'}>
        <TextInput onChange={(event) => filterDropdownData(getDropdownData(event.target.value))} placeholder="Search for a video"/>
      </Flex>
      <Flex>
        <Dropdown
        isOpen={true}
        dropdownContainerClassName={"dropdown"}
        >
          <DropdownList className={"dropdown-list"} maxHeight={500}>
          {[...dropdownData].map((item) => (
            <DropdownListItem onClick={() => updateVideoIds(item.id)} isActive={selectedIds.findIndex(selectedId => selectedId === item.id) !== -1} key={`key-${item.id}`}>
              {item.name}
            </DropdownListItem>
          ))}
          </DropdownList>
        </Dropdown>
      </Flex>
    </Flex>
    );
};

export default Field;
