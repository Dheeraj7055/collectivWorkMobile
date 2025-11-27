import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

type Props = {
  description?: string | null;
  id: string | number;
  initialCollapsed?: boolean; // default: true
  maxChars?: number;          // default: 250
  linkColor?: string;         // optional brand color
};

const YT_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})([^\s]*)?/i;

const extractYouTube = (text: string) => {
  if (!text) return { videoId: null as string | null, linkUrl: null as string | null, parts: [text] as string[] };

  const match = text.match(YT_REGEX);
  if (!match) return { videoId: null, linkUrl: null, parts: [text] };

  const videoId = match[1];
  const linkUrl = match[0];
  const parts = text.split(linkUrl); // [before, after]
  return { videoId, linkUrl, parts };
};

const formatWithLineBreaks = (txt: string) => {
  // Convert \n into separate Text nodes with explicit line breaks
  const segs = txt.split('\n');
  return segs.map((seg, i) => (
    <Text key={i}>
      {seg}
      {i < segs.length - 1 ? '\n' : ''}
    </Text>
  ));
};

export const DescriptionYoutube: React.FC<Props> = ({
  description,
  id,
  initialCollapsed = true,
  maxChars = 250,
  linkColor = '#1e66a5',
}) => {
  const [expanded, setExpanded] = useState(!initialCollapsed);

  const {
    beforeText,
    afterText,
    linkUrl,
    videoId,
    isLongText,
  } = useMemo(() => {
    const desc = description ?? '';
    const { videoId, linkUrl, parts } = extractYouTube(desc);
    const before = parts[0] ?? '';
    const after = parts[1] ?? '';
    const isLong = desc.length > maxChars;
    return {
      beforeText: before,
      afterText: after,
      linkUrl,
      videoId,
      isLongText: isLong,
    };
  }, [description, maxChars]);

  const trimmed = (txt: string) =>
    expanded ? txt : txt.slice(0, maxChars);

  if (!description) return null;

  return (
    <View>
      {/* BEFORE */}
      {beforeText ? <Text style={{ lineHeight: 20 }}>
        {formatWithLineBreaks(trimmed(beforeText))}
      </Text> : ''}

      {/* ...more / ...less for BEFORE if long and no link after trimming boundary */}
      {beforeText && isLongText && (
        <Text
          onPress={() => setExpanded(v => !v)}
          style={{ marginLeft: 4, color: '#666' }}
        >
          {expanded ? '...less' : '...more'}
        </Text>
      )}

      {/* LINK + PLAYER */}
      {!!videoId && (
        <View>
          {!!linkUrl && (
            <Text
              onPress={() => Linking.openURL(linkUrl)}
              style={{ color: linkColor, marginBottom: 6 }}
            >
              {linkUrl}
            </Text>
          )}
          <View style={{ width: '100%', aspectRatio: 16 / 9 }}>
            <YoutubePlayer
              height={230}
              videoId={videoId}
              play={false}
              webViewProps={{ allowsFullscreenVideo: true }}
            />
          </View>
        </View>
      )}

      {/* AFTER */}
      {!!afterText && (
        <>
          <Text style={{ lineHeight: 20, marginTop: 8 }}>
            {formatWithLineBreaks(trimmed(afterText))}
          </Text>
          {isLongText && (
            <Text
              onPress={() => setExpanded(v => !v)}
              style={{ marginLeft: 4, color: '#666' }}
            >
              {expanded ? '...less' : '...more'}
            </Text>
          )}
        </>
      )}
    </View>
  );
};
