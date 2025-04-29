import React, { useState } from 'react';
import useResources from '../../../hooks/useResources';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ResourceTab from './ResourceTab';
import Spreadsheet from '../ClassroomResources/Spreadsheet';

const Resources = ({ course_code }) => {
    const [resources] = useResources();
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
                    <ResourceTab items={playlist}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={mid}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={final}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={slides}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={notes}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={practicesheet}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={books}></ResourceTab>
                </TabPanel>
                <TabPanel>
                    <ResourceTab items={others}></ResourceTab>
                </TabPanel>
            </Tabs>

            <Spreadsheet></Spreadsheet>
        </div>
    );
};

export default Resources;
