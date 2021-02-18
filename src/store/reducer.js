import { print } from '../globalFunc';


const initalState = {
    language: 'en',
    count: 0
}

const Reducer = (state = initalState, action) => {
    switch(action.type){
        case 'UPDATE_LANGUAGE':
            const lang = action.lang;
            print(action.type, 'green', lang)
            return { ...state, language: lang }
        case 'ADD_COUNT':
            print(action.type, 'green', state.count + 1)
            return { ...state, count: state.count + 1 }
        default:
            return state;
    }
}

export default Reducer;