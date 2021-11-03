import React, {useState, useEffect} from 'react';
import { 
  Button,
  Dropdown, 
  DropdownList, 
  DropdownListItem, 
  Grid,
  GridItem,
  Flex,
  Modal,
  Paragraph, 
  Pill, 
  TextInput,
  Spinner
} from '@contentful/forma-36-react-components';
// import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { WistiaItem } from "./ConfigScreen";
import { fetchVideos } from "../functions/getVideos";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

// const SortablePill = SortableElement(({value:WistaItem}) => 
//   <Pill 
//     style={{width: 300, marginRight: 10, marginBottom: 10}} 
//     label={value.name} 
//     onClose={() => updateVideoIds(value.id)} 
//     key={value.id}
//     onDrag={(() => console.log("hi"))}
//   />
// )

const Field = (props: FieldProps) => {
  const { sdk } = props;
  const [data, updateData] = useState<WistiaItem[] | []>([])
  const [selectedIds, setIds] = useState<number[]>([])
  const [dropdownData, filterDropdownData] = useState<WistiaItem[] | []>([])
  const [loading, updateLoadingStatus] = useState(true)
  const [isShown, setShown] = useState(false)
  sdk.window.startAutoResizer()

  // Set inital state based on field values
  useEffect(() => {
    const fieldValues = sdk.field.getValue()
    setIds(
      fieldValues !== undefined && fieldValues.items.length > 0 ? 
        fieldValues.items.map((item:WistiaItem) => item.id) :[]
    )

    const parameters:any = sdk.parameters.installation;
    
    (async () => {
      const videos = await fetchVideos(
        parameters.projects, parameters.excludedProjects, parameters.apiPassword
      )
      updateData(videos)
      filterDropdownData(videos)
      updateLoadingStatus(false)
    })();
      
  }, [sdk.field, sdk.parameters.installation])

  // Function to update selected video ids
  const updateVideoIds = (id:any) => {
    const updatedIds = 
      selectedIds.findIndex(selectedId => selectedId === id) === -1 ?
      [...selectedIds, id] :
      [...selectedIds.filter(selectedId => selectedId!== id)]

    setIds(updatedIds);
    setNewValues(updatedIds);
  }
  
  // set field value with updated state
  const setNewValues = (updatedIds:number[]) => {
    sdk.field.setValue(
      {
        items: data.filter(item => 
          updatedIds.findIndex(updatedId => item.id === updatedId) !== -1
        )
      }
    )
  }

  const getDropdownData = (searchTerm:string) => {
    const newDropdownData = [...data].filter((item:WistiaItem) => 
      item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    )
    return newDropdownData;
  }

  return (
    <>
      {loading ? (
        <Paragraph>Loading Wistia videos <Spinner color ="primary"/></Paragraph>
      ):(
        <Flex 
          flexDirection={"column"} 
          fullHeight={true} 
          style={{minHeight: 500}}
        >
          {sdk.field.getValue() && sdk.field.getValue().items.length > 0 && (
            <Flex flexDirection={"column"} marginBottom={"spacingL"}>
              <Paragraph style={{marginBottom: 10}}>
                Selected Videos
              </Paragraph>
              <Flex flexWrap={"wrap"}>
                {sdk.field.getValue().items.map((item:WistiaItem) => (
                  <Pill 
                    style={{width: 300, marginRight: 10, marginBottom: 10}} 
                    label={item.name} 
                    onClose={() => updateVideoIds(item.id)} 
                    key={item.id}
                    onDrag={(() => console.log("hi"))}
                  />
                ))}
              </Flex>
            </Flex>
          )}
          <Flex>
            {/* <Button onClick={() => setShown(true)}>Select Videos</Button>
            <Modal
              isShown={isShown}
              onClose={() => setShown(false)}
            > */}
              <Flex marginBottom={'spacingS'}>
                <TextInput 
                  onChange={
                    (event) => filterDropdownData(getDropdownData(event.target.value))
                  } 
                  placeholder="Search for a video"
                />
              </Flex>
              <Flex>
                <Dropdown isOpen={true}>
                  {[...dropdownData].map((item) => (
                    <DropdownList>
                      <DropdownListItem 
                        onClick={() => updateVideoIds(item.id)} 
                        isActive={
                          selectedIds.findIndex(selectedId => selectedId === item.id) !== -1
                        } 
                        key={`key-${item.id}`}
                      >
                        {item.name}
                      </DropdownListItem>
                    </DropdownList>
                  ))}
                </Dropdown>
              </Flex>
            {/* </Modal> */}
          </Flex>
        </Flex>
      )}
    </>
  );
};
// const ModalSelection = (props: {dropdownData: WistiaItem[]}) => {
//   const [isShown, setShown] = useState(false)
//   return (
//   <Flex>
//     <Button onClick={() => setShown(true)}>Select Videos</Button>
//     <Modal
//       isShown={isShown}
//       onClose={() => setShown(false)}
//     >
//       <Flex marginBottom={'spacingS'}>
//         <TextInput 
//           onChange={(event) => filterDropdownData(getDropdownData(event.target.value))} placeholder="Search for a video"
//         />
//       </Flex>
//       <Grid>
//         {dropdownData.map(item)}
//       </Grid>
//     </Modal>
//   </Flex>
//   )
// }

export default Field;
