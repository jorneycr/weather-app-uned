import { renderHook, act } from '@testing-library/react';
import useWeather from '../hooks/useWeather';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);
const appId = '3b342fe229d4b7adcda88a15f0893213';

describe('Hook useWeather', () => {
    afterEach(() => {
        mock.reset();
    });

    it('debería obtener datos del clima correctamente', async () => {
        mock
            .onGet(`https://api.openweathermap.org/geo/1.0/direct?q=London,GB&appid=${appId}`)
            .reply(200, [{ lat: 51.5074, lon: -0.1278 }]);

        mock
            .onGet(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${appId}`)
            .reply(200, {
                name: 'London',
                main: { temp: 293.15, temp_max: 295.15, temp_min: 290.15 },
            });

        const { result } = renderHook(() => useWeather());

        await act(async () => {
            await result.current.fetchWeather({ city: 'London', country: 'GB' });
        });

        expect(result.current.weather.name).toBe('London');
        expect(result.current.weather.main.temp).toBe(293.15);
    });

    it('debería manejar la ciudad no encontrada', async () => {
        mock
            .onGet(`https://api.openweathermap.org/geo/1.0/direct?q=Unknown,GB&appid=${appId}`)
            .reply(200, []);

        const { result } = renderHook(() => useWeather());

        await act(async () => {
            await result.current.fetchWeather({ city: 'Unknown', country: 'GB' });
        });

        expect(result.current.notFound).toBe(true);
    });
});
