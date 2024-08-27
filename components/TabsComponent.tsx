import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface TabData {
  title: string;
  content: JSX.Element;
}

interface TabsComponentProps {
  tabData: TabData[];
}

const TabsComponent: FC<TabsComponentProps> = ({ tabData }) => (
  <Tabs
    defaultValue={tabData[0].title.toLowerCase().replace(/ /g, '')}
    className='flex-grow  overflow-hidden'
  >
    <TabsList className='w-full'>
      {tabData.map((tab, index) => (
        <TabsTrigger
          key={index}
          value={tab.title.toLowerCase().replace(/ /g, '')}
          className='w-full'
        >
          {tab.title}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabData.map((tab, index) => (
      <TabsContent
        key={index}
        value={tab.title.toLowerCase().replace(/ /g, '')}
      >
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

export default TabsComponent;
