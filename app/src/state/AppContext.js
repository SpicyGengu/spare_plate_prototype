import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, connectSocket, probeServer } from "../api/client";
import {
  cancelReservation,
  collectReservation,
  createSeed,
  publishListing,
  reserveListing,
} from "../data/domain";

const AppContext = createContext(null);

function upsert(list, item) {
  if (!item) return list;
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...list];
  const next = list.slice();
  next[index] = item;
  return next;
}

export function AppProvider({ children }) {
  const [role, setRoleState] = useState("consumer");
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeMerchantId, setActiveMerchantId] = useState("m_bakery");
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState("local");
  const [toast, setToast] = useState(null);

  const sourceRef = useRef("local");
  const listingsRef = useRef([]);
  const reservationsRef = useRef([]);
  const merchantsRef = useRef([]);

  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);
  useEffect(() => {
    reservationsRef.current = reservations;
  }, [reservations]);
  useEffect(() => {
    merchantsRef.current = merchants;
  }, [merchants]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const snapshot = useCallback(
    () => ({
      merchants: merchantsRef.current,
      listings: listingsRef.current,
      reservations: reservationsRef.current,
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    let disconnect = () => {};

    const hydrateLocal = () => {
      const seed = createSeed();
      setMerchants(seed.merchants);
      setListings(seed.listings);
      setReservations(seed.reservations);
      sourceRef.current = "local";
      setSource("local");
    };

    (async () => {
      const online = await probeServer();
      if (cancelled) return;
      if (!online) {
        hydrateLocal();
        setReady(true);
        return;
      }
      try {
        const remote = await api.getState();
        if (cancelled) return;
        setMerchants(remote.merchants);
        setListings(remote.listings);
        setReservations(remote.reservations);
        sourceRef.current = "remote";
        setSource("remote");
        disconnect = connectSocket({
          onListing: (listing) => setListings((prev) => upsert(prev, listing)),
          onReservation: (reservation) => setReservations((prev) => upsert(prev, reservation)),
        });
      } catch {
        if (!cancelled) hydrateLocal();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      disconnect();
    };
  }, []);

  const refresh = useCallback(async () => {
    if (sourceRef.current !== "remote") {
      showToast("Showing the on-device Parramatta demo");
      return;
    }
    const remote = await api.getState();
    setMerchants(remote.merchants);
    setListings(remote.listings);
    setReservations(remote.reservations);
  }, [showToast]);

  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const setRole = useCallback((next) => {
    setRoleState(next);
  }, []);

  const createListing = useCallback(
    async (input) => {
      if (sourceRef.current === "remote") {
        const listing = await api.createListing(input);
        setListings((prev) => upsert(prev, listing));
        showToast("Listing is live");
        return listing;
      }
      const result = publishListing(snapshot(), input);
      setListings(result.listings);
      showToast("Listing is live");
      return result.listing;
    },
    [showToast, snapshot]
  );

  const reserve = useCallback(
    async (input) => {
      if (sourceRef.current === "remote") {
        const result = await api.reserve(input);
        setListings((prev) => upsert(prev, result.listing));
        setReservations((prev) => upsert(prev, result.reservation));
        showToast("Reserved");
        return result.reservation;
      }
      const result = reserveListing(snapshot(), input);
      setListings(result.listings);
      setReservations(result.reservations);
      showToast("Reserved");
      return result.reservation;
    },
    [showToast, snapshot]
  );

  const collect = useCallback(
    async (id) => {
      if (sourceRef.current === "remote") {
        const result = await api.collect(id);
        setReservations((prev) => upsert(prev, result.reservation));
        showToast("Marked as collected");
        return result.reservation;
      }
      const result = collectReservation(snapshot(), { id });
      setReservations(result.reservations);
      showToast("Marked as collected");
      return result.reservation;
    },
    [showToast, snapshot]
  );

  const collectByCode = useCallback(
    async (code) => {
      if (sourceRef.current === "remote") {
        const result = await api.collectByCode(code);
        setReservations((prev) => upsert(prev, result.reservation));
        showToast("Voucher collected");
        return result.reservation;
      }
      const result = collectReservation(snapshot(), { code });
      setReservations(result.reservations);
      showToast("Voucher collected");
      return result.reservation;
    },
    [showToast, snapshot]
  );

  const cancel = useCallback(
    async (id) => {
      if (sourceRef.current === "remote") {
        const result = await api.cancel(id);
        if (result.listing) setListings((prev) => upsert(prev, result.listing));
        setReservations((prev) => upsert(prev, result.reservation));
        showToast("Reservation cancelled");
        return result.reservation;
      }
      const result = cancelReservation(snapshot(), id);
      setListings(result.listings);
      setReservations(result.reservations);
      showToast("Reservation cancelled");
      return result.reservation;
    },
    [showToast, snapshot]
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      hasOnboarded,
      completeOnboarding,
      merchants,
      listings,
      reservations,
      activeMerchantId,
      setActiveMerchantId,
      ready,
      source,
      toast,
      showToast,
      refresh,
      createListing,
      reserve,
      collect,
      collectByCode,
      cancel,
    }),
    [
      role,
      setRole,
      hasOnboarded,
      completeOnboarding,
      merchants,
      listings,
      reservations,
      activeMerchantId,
      ready,
      source,
      toast,
      showToast,
      refresh,
      createListing,
      reserve,
      collect,
      collectByCode,
      cancel,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
