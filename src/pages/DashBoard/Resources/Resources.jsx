import React, { useState } from 'react';
import useResources from '../../../hooks/useResources';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ResourceTab from './ResourceTab';
import useAdmin from '../../../hooks/useAdmin';


const Resources = ({ course_code }) => {
    const [resources, refetch] = useResources();
    const filteredResources = resources.filter(resource => resource.course_code == course_code)

    const playlist = filteredResources.filter(resource => resource.type == "youtube")
    const mid = filteredResources.filter(resource => resource.type == "mid")
    const final = filteredResources.filter(resource => resource.type == "final")
    const slides = filteredResources.filter(resource => resource.type == "slides")
    const practicesheet = filteredResources.filter(resource => resource.type == "practicesheet")
    const notes = filteredResources.filter(resource => resource.type == "notes")
    const books = filteredResources.filter(resource => resource.type == "book")
    const others = filteredResources.filter(resource => resource.type == "others")

    const [tabIndex, setTabIndex] = useState(0);

    const isAdmin = useAdmin();

    return (
        <div className="p-4">
            <SectionTitle
                heading="Resources"
                subHeading="Find your resource here"
            >
            </SectionTitle>
            <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
                <TabList>
                    <Tab>Playlist</Tab>
                    <Tab>Mid</Tab>
                    <Tab>Final</Tab>
                    <Tab>Slides</Tab>
                    <Tab>Notes</Tab>
                    <Tab>Practice Sheet</Tab>
                    <Tab>Books</Tab>
                    <Tab>Others</Tab>
                </TabList>
                <TabPanel>
                    <ResourceTab items={playlist} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={mid} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={final} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={slides} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={notes} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={practicesheet} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={books} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={others} isAdmin={isAdmin} refetch={refetch}></ResourceTab>
                </TabPanel>
            </Tabs>

            
        </div>
    );
};

export default Resources;
