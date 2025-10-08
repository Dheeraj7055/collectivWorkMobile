// PostRepostPreview.tsx
import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';
import ImageViewing from 'react-native-image-viewing';
import moment from 'moment';
import { Announcement } from '@/types/announcement';
import { styles } from '@/styles/postCardStyles';
import { Award, Star, Gift } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface PostRepostPreviewProps {
  announcement: Announcement;
}

export const PostRepostPreview: React.FC<PostRepostPreviewProps> = ({
  announcement,
}) => {
  const images = announcement?.document_urls || [];
  const bitmapImages = images.filter(
    m => m.type.startsWith('image/') && m.type !== 'image/svg+xml',
  );

  const [isViewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [svgViewerVisible, setSvgViewerVisible] = useState(false);
  const [svgIndex, setSvgIndex] = useState(0);

  const openViewer = (index: number) => {
    const item = images[index];
    if (item.type === 'image/svg+xml') {
      setSvgIndex(index);
      setSvgViewerVisible(true);
    } else {
      const idx = bitmapImages.findIndex(m => m.id === item.id);
      setViewerIndex(idx);
      setViewerVisible(true);
    }
  };

  /** Render images, videos, SVGs */
  const renderMedia = (item: any, style: any, index: number) => {
    if (item.type.startsWith('image/')) {
      return (
        <TouchableOpacity key={index} onPress={() => openViewer(index)}>
          {item.type === 'image/svg+xml' ? (
            <SvgUri uri={item.url} width="100%" height={150} />
          ) : (
            <Image source={{ uri: item.url }} style={style} />
          )}
        </TouchableOpacity>
      );
    }

    if (item.type.startsWith('video/')) {
      return (
        <View key={index} style={style}>
          <video
            controls
            style={{ width: '100%', height: 150, borderRadius: 8 }}
            src={item.url}
          />
        </View>
      );
    }

    return null;
  };

  const renderImageGrid = () => {
    if (!images?.length) return null;

    if (images.length === 1)
      return renderMedia(images[0], styles.singleImage, 0);

    if (images.length === 2)
      return (
        <View style={styles.row}>
          {images.map((img, idx) => (
            <View key={img.id} style={{ flex: 1, marginHorizontal: 1 }}>
              {renderMedia(img, styles.halfImage, idx)}
            </View>
          ))}
        </View>
      );

    if (images.length === 3)
      return (
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 1 }}>
            {renderMedia(images[0], styles.leftLarge, 0)}
          </View>
          <View style={styles.rightColumn}>
            {renderMedia(images[1], styles.quarterImage, 1)}
            {renderMedia(images[2], styles.quarterImage, 2)}
          </View>
        </View>
      );

    if (images.length > 3)
      return (
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 1 }}>
            {renderMedia(images[0], styles.leftLarge, 0)}
          </View>
          <View style={styles.rightColumn}>
            {renderMedia(images[1], styles.quarterImage, 1)}
            <TouchableOpacity
              onPress={() => openViewer(2)}
              style={styles.moreContainer}
            >
              {renderMedia(images[2], styles.quarterImage, 2)}
              <View style={styles.overlay}>
                <Text style={styles.moreText}>+{images.length - 3}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
  };

  const BadgeIcons: Record<string, JSX.Element> = {
    iconaward: <Award size={30} color="#fff" />,
    iconstar: <Star size={30} color="#fff" />,
    icongift: <Gift size={30} color="#fff" />,
  };

  return (
    <ScrollView
      style={{
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
      }}
    >
      {/* 🔹 Text/Media */}
      {announcement.type !== 'poll' ? (
        <View>
          <Text style={styles.title}>{announcement.subject}</Text>
          <Text style={styles.content}>{announcement.description}</Text>
          {renderImageGrid()}

          {/* Image Viewer */}
          <ImageViewing
            images={bitmapImages.map(img => ({ uri: img.url }))}
            imageIndex={viewerIndex}
            visible={isViewerVisible}
            onRequestClose={() => setViewerVisible(false)}
          />

          {/* SVG Viewer */}
          <Modal
            visible={svgViewerVisible}
            transparent
            onRequestClose={() => setSvgViewerVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'black',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SvgUri
                uri={images[svgIndex]?.url}
                width={width * 0.9}
                height={height * 0.7}
              />
              <TouchableOpacity
                style={{ position: 'absolute', top: 40, right: 20 }}
                onPress={() => setSvgViewerVisible(false)}
              >
                <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      ) : (
        /* 🔹 Poll View */
        <View>
          <Text style={styles.title}>{announcement.question}</Text>
          {announcement.options?.map((opt, i) => (
            <View
              key={i}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                marginVertical: 4,
                opacity: 0.7,
              }}
            >
              <Text style={{ color: '#333' }}>{opt}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={{
              marginTop: 12,
              backgroundColor: '#ccc',
              paddingVertical: 8,
              borderRadius: 6,
            }}
            disabled
          >
            <Text style={{ textAlign: 'center', color: 'white' }}>Vote</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔹 Certificate View */}
      {announcement?.Badge?.id && (
        <View
          style={{
            marginTop: 12,
            backgroundColor: announcement.Badge.color,
            padding: 12,
            borderRadius: 8,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>
              CERTIFICATE OF APPRECIATION
            </Text>

            <View
              style={{
                position: 'relative',
                width: 60,
                height: 80,
                marginTop: 10,
              }}
            >
              <Svg width={54} height={71} viewBox="0 0 54 71" fill="none">
                <Path
                  d="M26.0945 52.0416L21.0855 69.9999L14.8202 62.7222L5.69264 65.7065L10.7017 47.7481C11.0812 46.3873 11.9858 45.233 13.2165 44.5392C14.4471 43.8453 15.903 43.6688 17.2638 44.0483L22.3947 45.4795C23.7555 45.859 24.9098 46.7636 25.6037 47.9943C26.2975 49.2249 26.4741 50.6808 26.0945 52.0416Z"
                  stroke={announcement.Badge.color || '#F9A80A'}
                  strokeWidth={1.86438}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M43.8241 47.7423L48.8346 65.7002L39.7068 62.7168L33.4421 69.995L28.4316 52.0371C28.0519 50.6763 28.2283 49.2204 28.9221 47.9897C29.6158 46.759 30.77 45.8543 32.1308 45.4747L37.2617 44.0431C38.6224 43.6634 40.0783 43.8398 41.309 44.5336C42.5397 45.2273 43.4444 46.3815 43.8241 47.7423Z"
                  stroke={announcement.Badge.color || '#F9A80A'}
                  strokeWidth={1.86438}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Rect
                  x={0.367188}
                  width={53.2681}
                  height={53.2681}
                  rx={26.634}
                  fill={announcement.Badge.color || '#F9A80A'}
                />
              </Svg>
              <View
                style={{
                  position: 'absolute',
                  top: '13%',
                  left: '20%',
                }}
              >
                {announcement?.Badge?.icon &&
                  BadgeIcons[announcement.Badge.icon.toLowerCase()]}
              </View>
            </View>

            <Text style={{ marginTop: 6, color: '#000', fontWeight: '700' }}>
              {announcement.Badge.name}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontStyle: 'italic',
                color: '#000',
              }}
            >
              {announcement.description || 'Description'}
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: '#000',
                fontSize: 12,
              }}
            >
              Praised by {announcement.createdByUser?.first_name} on{' '}
              {moment(announcement.Badge.created_at).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
