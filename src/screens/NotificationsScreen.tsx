// screens/NotificationsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchNotificationList,
  fetchNotificationCount,
  markAllViewed,
  markNotificationsRead,
  locallySetRead,
} from '@/redux/slices/notificationSlice';

type TabKey = 'all' | 'unread';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function initials(first?: string, last?: string) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() || 'U';
}

export default function NotificationsScreen() {
  const [tab, setTab] = React.useState<TabKey>('all');
  const dispatch = useAppDispatch();

  const list = useAppSelector(s => s.notifications.records);
  const loading = useAppSelector(s => s.notifications.isListLoading);
  const loadingMore = useAppSelector(s => s.notifications.isLoadingMore);
  const page = useAppSelector(s => s.notifications.page);
  const totalPages = useAppSelector(s => s.notifications.totalPages);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(markAllViewed()).finally(() => {
        dispatch(fetchNotificationCount());
      });
      dispatch(
        fetchNotificationList({
          page: 1,
          pageSize: 10,
          searchTerm: '',
          isPagination: true,
          module_name: 'HRMS',
          append: false,
        }),
      );
    }, [dispatch]),
  );

  const filtered = React.useMemo(
    () => (tab === 'all' ? list : list.filter(n => !n.read)),
    [tab, list],
  );

  const sections = React.useMemo(
    () => [{ title: 'All', data: filtered }],
    [filtered],
  );

  const onMarkAllRead = async () => {
    await dispatch(markNotificationsRead({ all: true }));
    await dispatch(fetchNotificationCount());

    dispatch(
      fetchNotificationList({
        page: 1,
        pageSize: 10,
        searchTerm: '',
        isPagination: true,
        module_name: 'HRMS',
        append: false,
      }),
    );
  };

  const onMarkOneRead = async (id: string | number) => {
    dispatch(locallySetRead({ id }));
    await dispatch(markNotificationsRead({ id }));
    await dispatch(fetchNotificationCount());
  };

  const renderRow = (item: any) => {
    const sender = item?.sentByNotifications || item?.sender || {};
    const fname = sender?.first_name || '';
    const lname = sender?.last_name || '';
    const avatar = sender?.image_url || '';
    const color = sender?.profile_color || 'rgba(64,81,137,0.1)';

    return (
      <View style={styles.itemRow}>
        {/* unread dot */}
        {!item.read ? (
          <View style={styles.unreadDot} />
        ) : (
          <View style={{ width: 8, marginRight: 8 }} />
        )}

        {/* avatar or initials in colored circle (matches Next.js mapping) */}
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.initials, { backgroundColor: color }]}>
            <Text style={styles.initialsText}>{initials(fname, lname)}</Text>
          </View>
        )}

        {/* text block */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name} numberOfLines={1}>
              {item.title || `${fname} ${lname}`.trim() || 'Notification'}
            </Text>
            <Text style={styles.timeBadge}> {timeAgo(item.created_at)}</Text>
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.message?.replace(/<[^>]+>/g, '') || ''}
          </Text>
        </View>

        {/* mark as read button (only if unread) */}
        {!item.read && (
          <TouchableOpacity
            onPress={() => onMarkOneRead(item.id)}
            style={styles.markReadPill}
            accessibilityLabel="Mark as read"
          >
            <View style={styles.readDot} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Infinite scroll handler
  const handleEndReached = React.useCallback(() => {
    if (loading || loadingMore) return;
    if (page >= totalPages) return;

    dispatch(
      fetchNotificationList({
        page: page + 1,
        pageSize: 10,
        searchTerm: '',
        isPagination: true,
        module_name: 'HRMS',
        append: true, // append next page
      }),
    );
  }, [dispatch, loading, loadingMore, page, totalPages]);

  return (
    <View style={styles.screen}>
      {/* Top row: tabs + mark all */}
      <View style={styles.topRow}>
        <View style={styles.tabsLeft}>
          <TouchableOpacity
            onPress={() => setTab('all')}
            style={[styles.tabChip, tab === 'all' && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === 'all' && styles.tabTextActive]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('unread')}
            style={[styles.tabChip, tab === 'unread' && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}
            >
              Unread
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onMarkAllRead}>
          <Text style={styles.markAll}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Card container (white) */}
      <View style={styles.card}>
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={() => null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => renderRow(item)}
          refreshing={loading && !loadingMore}
          onRefresh={() =>
            dispatch(
              fetchNotificationList({
                page: 1,
                pageSize: 10,
                searchTerm: '',
                isPagination: true,
                module_name: 'HRMS',
                append: false,
              }),
            )
          }
          onEndReachedThreshold={0.3}
          onEndReached={handleEndReached}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8' }}>Loading more…</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#64748B' }}>No notifications</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  tabsLeft: { flexDirection: 'row', gap: 8 },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8EEF5',
  },
  tabActive: { backgroundColor: '#E3F2FD' },
  tabText: { color: '#475569', fontWeight: '600' },
  tabTextActive: { color: '#1976D2' },
  markAll: { color: '#1976D2', fontWeight: '700' },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
    marginTop: 8,
  },

  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEF2F6',
    marginLeft: 12,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  initials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: { color: '#fff', fontWeight: '700' },

  name: { fontWeight: '700', color: '#0F172A' },
  message: { color: '#64748B', marginTop: 2 },
  timeBadge: {
    color: '#94A3B8',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },

  markReadPill: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    marginLeft: 8,
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0052CC',
  },
});
