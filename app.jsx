import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, defaultTheme, Flex, View, Heading, Text, Content, Well, ActionButton } from '@adobe/react-spectrum';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View padding="size-400" maxWidth="960px" marginX="auto">
        <Flex direction="column" gap="size-300">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={1}>{'{{PROJECT_NAME}}'}</Heading>
            <Flex alignItems="center" gap="size-150">
              <Text>{user.name || user.email}</Text>
              <ActionButton
                isQuiet
                onPress={() => { window.location.href = '/cdn-cgi/access/logout'; }}
              >
                Log out
              </ActionButton>
            </Flex>
          </Flex>
          <Well>
            <Content>
              <Text>{'{{PROJECT_DESCRIPTION}}'}</Text>
            </Content>
          </Well>
        </Flex>
      </View>
    </Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
