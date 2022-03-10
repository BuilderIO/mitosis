import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

export default function Button(props) {
  return (
    <>
      {props.link ? (
        <>
          <View
            {...props.attributes}
            role="button"
            href={props.link}
            target={props.openLinkInNewTab ? "_blank" : undefined}
          >
            <Text>{props.text}</Text>
          </View>
        </>
      ) : (
        <View {...props.attributes}>
          <Text>{props.text}</Text>
        </View>
      )}
    </>
  );
}
