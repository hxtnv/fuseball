import EventEmitter from "eventemitter3";

type FunctionType = (...args: any[]) => void;

const eventEmitter = new EventEmitter();
const Emitter = {
  on: (event: string, fn: FunctionType) => eventEmitter.on(event, fn),
  once: (event: string, fn: FunctionType) => eventEmitter.once(event, fn),
  off: (event: string, fn: FunctionType) => eventEmitter.off(event, fn),
  emit: (event: string, payload?: any) => eventEmitter.emit(event, payload),
};
Object.freeze(Emitter);

export default Emitter;
