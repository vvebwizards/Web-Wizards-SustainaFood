import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    HTMLAttributes,
  } from "react";
  
  interface TabsContextValue {
    value: string;
    setValue: (val: string) => void;
  }
  
  const TabsContext = createContext<TabsContextValue | undefined>(undefined);
  
  interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    defaultValue: string;
    children: ReactNode;
    className?: string;
  }
  
  export const Tabs: React.FC<TabsProps> = ({
    defaultValue,
    children,
    className = "",
    ...props
  }) => {
    const [value, setValue] = useState(defaultValue);
  
    return (
      <TabsContext.Provider value={{ value, setValue }}>
        <div className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  };
  
  interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
  }
  
  export const TabsList: React.FC<TabsListProps> = ({
    children,
    className = "",
    ...props
  }) => (
    <div className={`flex space-x-4 border-b ${className}`} {...props}>
      {children}
    </div>
  );
  
  interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    value: string;
    children: ReactNode;
    className?: string;
  }
  
  export const TabsTrigger: React.FC<TabsTriggerProps> = ({
    value: tabValue,
    children,
    className = "",
    ...props
  }) => {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error("TabsTrigger must be inside <Tabs>");
  
    const isActive = ctx.value === tabValue;
    return (
      <button
        className={`py-2 px-4 ${
          isActive
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-blue-600"
        } ${className}`}
        onClick={() => ctx.setValue(tabValue)}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    children: ReactNode;
    className?: string;
  }
  
  export const TabsContent: React.FC<TabsContentProps> = ({
    value: tabValue,
    children,
    className = "",
    ...props
  }) => {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error("TabsContent must be inside <Tabs>");
  
    return ctx.value === tabValue ? (
      <div className={className} {...props}>
        {children}
      </div>
    ) : null;
  };
  