import React, { useCallback, useState, useEffect } from 'react';
import { AppExtensionSDK } from '@contentful/app-sdk';
import { 
  Button, 
  Heading, 
  Flex, 
  Workbench,
  Paragraph,
  TextField, 
  TextLink, 
  Notification, 
  Dropdown, 
  DropdownList, 
  DropdownListItem, 
  Pill 
} from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { fetchProjects } from "../functions/getVideos"

export interface AppInstallationParameters {
  apiPassword?: string;
  projects?: WistiaItem[];
  excludedProjects?: WistiaItem[];
}

interface ConfigProps {
  sdk: AppExtensionSDK;
}

export interface WistiaItem {
  id: number;
  name: string;
  hashedId: string;
}


const Config = (props: ConfigProps) => {
  const [parameters, setParameters] = useState<AppInstallationParameters>(
    {
      apiPassword: '',
      projects: [], 
      excludedProjects: []
    }
  );
  const [loading, setLoadingStatus] = useState(false);

  // Updates app configuration by calling this function as a callback in the app.sdk.onConfigure function
  const configureApp = useCallback(async () => {
    const currentState = await props.sdk.app.getCurrentState();
    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, props.sdk]);

  // Called whenever the config changes
  useEffect(() => {
    props.sdk.app.onConfigure(() => configureApp());
  }, [props.sdk, configureApp, parameters]);

  // Initial load for config page
  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null = 
        await props.sdk.app.getParameters();

      // Set local parameter state based on the installation params
      if (currentParameters) {
        setParameters(currentParameters);
      } else {
        setParameters({
          apiPassword:'',
          projects: [],
          excludedProjects: []
        })
      }

      props.sdk.app.setReady();
    })()
  }, [props.sdk])

  const handleFieldChange:(
    event:React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void = (event) => {
      const id  = event.target.id;
      const value = event.target.value;
      const newParameters:{[key:string]: any} = {
        ...parameters
      }
      newParameters[id] = value;
      setParameters(newParameters);
    }

    const getProjects:() => void = async () => {
      try {
        setLoadingStatus(true);
        const response = await fetchProjects(parameters.apiPassword);
        if (response.success) {
          Notification.success("Your connection to the Wistia Data API is working.")
          setParameters({
            apiPassword: parameters.apiPassword,
            projects: response.projects,
            excludedProjects: []
          })
        } else {
          Notification.error(`Connection to Wistia Data API failed: ${response.error}`)
        }
        setLoadingStatus(false)
      } catch(error) {
        Notification.error("Check console for errors.");
        console.log(error);
      }
    }

    const removeExcludedProject = (id:string) => {
      const newExcludedProjects = 
        parameters.excludedProjects ? [...parameters.excludedProjects].filter(
          item => id !== item.hashedId
        ) : []
      
      setParameters({
        ...parameters, 
        excludedProjects: newExcludedProjects
      })

      return;
    }
    
    const addExcludedProject = (item:WistiaItem) => {
      if(
        parameters.excludedProjects?.findIndex(project => project.hashedId === item.hashedId
      ) !== -1) {
        removeExcludedProject(item.hashedId);
        return;
      }
      const newExcludedProjects = 
        parameters.excludedProjects ? [...parameters.excludedProjects, item] : [item]
      
      setParameters({
        ...parameters, 
        excludedProjects: newExcludedProjects
      })

      return;
    }

  return (
    <>
      <Workbench className={css({ margin: '80px 80px 0px 80px'})}>
        <Flex flexDirection="column" fullHeight fullWidth>
          <Heading>Wistia Videos App Configuration</Heading>
          <Paragraph>
            Please provide your access token for the Wistia Data API.
          </Paragraph>
            <Flex flexDirection="column" marginTop="spacingM">
              <TextField 
                required 
                name="apiPassword" 
                id="apiPassword" 
                labelText="Wistia Data API access token" 
                onChange={(event:React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>  ) => handleFieldChange(event)} 
                value={parameters.apiPassword}
              />
              <TextLink
                href="https://wistia.com/support/developers/data-api#creating-and-managing-access-tokens" 
                target="_blank" 
                rel="noreferrer">
                  How to find your access token
              </TextLink>
            </Flex>
            {!parameters.projects?.length && (
              <Flex marginTop="spacingL">
                <Button
                  onClick={() => getProjects()}
                  loading={loading}
                >
                  Display Wistia projects
                </Button>
              </Flex>
            )}
          <Flex 
            flexDirection="column" 
            marginTop={"spacingXl"} 
            fullHeight
          >
            {!!parameters.projects?.length && (
              <>
                <Flex marginBottom="spacingXs">
                  <Heading element="h2">
                    Choose projects to exclude from the app.
                  </Heading>
                </Flex>
                <Flex marginBottom="spacingL">
                  <Paragraph>
                    Choose any projects that you think aren't relevant to what editors are doing in this Contentful space.
                  </Paragraph>
                </Flex>
                {!!parameters.excludedProjects?.length && (
                  <Flex marginBottom="spacingM" flexWrap="wrap" fullHeight>
                    {
                      parameters.excludedProjects.map(item => 
                        <Pill 
                          style={{width: 200, marginRight: 10, marginBottom: 10}} 
                          label={item.name} 
                          onClose={() => removeExcludedProject(item.hashedId)} 
                          key={item.id}
                        />
                      )
                    }
                  </Flex>
                )}
                <Dropdown
                  isOpen
                  isFullWidth
                  isAutoalignmentEnabled={false}
                  position={"bottom-left"}
                >
                  <DropdownList className={"dropdown-list"} maxHeight={500}>
                    {parameters.projects.map((item) => (
                      <DropdownListItem 
                        onClick={() => addExcludedProject(item)} 
                        isActive={
                          parameters.excludedProjects?.findIndex(
                            project => project.hashedId === item.hashedId
                          ) !== -1
                        } 
                        key={`key-${item.id}`}
                      >
                        {item.name}
                      </DropdownListItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </>
            )}
          </Flex>
        </Flex>
      </Workbench>
    </>
  );
}

export default Config;
